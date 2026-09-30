(function(){
"use strict";
const App=window.App;
if(!App) return;
if((App.currentFile||"").toLowerCase()!=="admin-promotions.html") return;

const CLASSES=Array.isArray(App.CLASSES)?App.CLASSES:[
  "قاعدہ","ناظرہ","ترجمہ","حفظ","تجوید","اعدادیہ","متوسطہ",
  "ثانویہ خاصہ سال اول","ثانویہ خاصہ سال دوم","عالیہ سال اول",
  "عالیہ سال دوم","عالمیہ سال اول","عالمیہ سال دوم / دورۂ حدیث"
];

let students=[];

function esc(v){return App.escape(v==null?"":v)}
function nextClass(current){
  const i=CLASSES.indexOf(App.safe(current).trim());
  return i>=0 && i<CLASSES.length-1 ? CLASSES[i+1] : "";
}
function classOptions(selected="",includeBlank=true){
  return (includeBlank?'<option value="">جماعت منتخب کریں</option>':'')+
    CLASSES.map(c=>'<option value="'+esc(c)+'"'+(c===selected?' selected':'')+'>'+esc(c)+'</option>').join("");
}
function setSelectOptions(id,selected="",label="جماعت منتخب کریں"){
  const el=App.el(id); if(!el) return;
  el.innerHTML='<option value="">'+esc(label)+'</option>'+
    CLASSES.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join("");
  if(selected && CLASSES.includes(selected)) el.value=selected;
}
function studentLabel(s){
  const ref=App.safe(s.admission_no||s.wifaq_registration_no||"").trim();
  const cls=App.safe(s.student_class||"").trim();
  return App.safe(s.name||"—")+(ref?" — "+ref:"")+(cls?" — "+cls:"");
}
function decisionTarget(current,decision){
  if(decision==="repeat" || decision==="completed") return current||"";
  return nextClass(current);
}
function applyDecision(current,decision,targetId,summaryId){
  const target=App.el(targetId);
  const summary=App.el(summaryId);
  const value=decisionTarget(current,decision);

  if(target){
    setSelectOptions(targetId,value,decision==="promoted"?"اگلی جماعت منتخب کریں":"جماعت");
    target.value=value||"";
    target.disabled=decision==="repeat"||decision==="completed";
  }

  if(summary){
    if(!current){summary.hidden=true;return;}
    let text="";
    if(decision==="repeat") text="طالبہ موجودہ جماعت «"+current+"» میں اعادہ کرے گی۔";
    else if(decision==="completed") text="تعلیم مکمل کے طور پر محفوظ ہوگا۔ موجودہ جماعت: «"+current+"»";
    else if(value) text="ترقی: «"+current+"» → «"+value+"»";
    else text="یہ آخری جماعت ہے۔ ترقی کے بجائے «تعلیم مکمل» منتخب کریں۔";
    summary.textContent=text;
    summary.hidden=false;
  }
}
function ensureValidTarget(current,decision,target){
  if(!current) throw new Error("موجودہ جماعت معلوم نہیں ہے۔");
  if(decision==="promoted"){
    const expected=nextClass(current);
    if(!expected) throw new Error("یہ آخری جماعت ہے۔ «تعلیم مکمل» منتخب کریں۔");
    if(target!==expected) throw new Error("اگلی درست جماعت: "+expected);
  }
  if((decision==="repeat"||decision==="completed") && target!==current){
    throw new Error("اس فیصلے میں جماعت تبدیل نہیں ہونی چاہیے۔");
  }
}
function populateStudentSelect(){
  const sel=App.el("promotionStudentId");
  if(!sel) return;
  sel.innerHTML='<option value="">طالبہ منتخب کریں</option>'+
    students.map(s=>'<option value="'+Number(s.id)+'">'+esc(studentLabel(s))+'</option>').join("");
}
function renderSelectedList(){
  const from=App.val("promotionSelectedFromClass");
  const box=App.el("promotionStudentSelectionList");
  if(!box) return;
  if(!from){
    box.innerHTML='<div class="print-empty">پہلے جماعت منتخب کریں۔</div>';
    updateSelectedCount();
    return;
  }
  const rows=students.filter(s=>App.safe(s.student_class).trim()===from);
  if(!rows.length){
    box.innerHTML='<div class="print-empty">اس جماعت میں کوئی طالبہ موجود نہیں۔</div>';
    updateSelectedCount();
    return;
  }
  box.innerHTML=rows.map(s=>
    '<label class="promotion-student-row">'+
      '<input type="checkbox" data-promotion-student value="'+Number(s.id)+'">'+
      '<span><strong>'+esc(s.name||"—")+'</strong><small>'+esc(s.admission_no||s.wifaq_registration_no||"")+'</small></span>'+
    '</label>'
  ).join("");
  box.querySelectorAll("[data-promotion-student]").forEach(cb=>cb.addEventListener("change",updateSelectedCount));
  updateSelectedCount();
}
function updateSelectedCount(){
  const n=document.querySelectorAll("[data-promotion-student]:checked").length;
  App.setText("promotionSelectedCount",n+" منتخب","0 منتخب");
}
function syncSelectedTarget(){
  const current=App.val("promotionSelectedFromClass");
  const decision=App.val("promotionSelectedDecision")||"promoted";
  applyDecision(current,decision,"promotionSelectedToClass",null);
}
function syncWholeTarget(){
  const current=App.val("promotionFromClass");
  const decision=App.val("promotionWholeDecision")||"promoted";
  applyDecision(current,decision,"promotionWholeToClass","wholePromotionSummary");
}
function syncSingle(){
  const id=Number(App.val("promotionStudentId"));
  const s=students.find(x=>Number(x.id)===id);
  const current=App.safe(s?.student_class).trim();
  const input=App.el("promotionCurrentClass");
  if(input) input.value=current;
  const decision=App.val("promotionDecision")||"promoted";
  applyDecision(current,decision,"promotionToClass","singlePromotionSummary");
}

async function boot(){
  try{
    students=App.asArray(await App.authedRpc("admin_get_students"))
      .filter(s=>Number(s?.id)>0)
      .sort((a,b)=>App.safe(a.name).localeCompare(App.safe(b.name),"ur"));
  }catch(error){
    console.error("Promotion students:",error);
    alert(error?.message||"طالبات کا ریکارڈ لوڈ نہیں ہو سکا۔");
    return;
  }

  populateStudentSelect();
  setSelectOptions("promotionSelectedFromClass","","جماعت منتخب کریں");
  setSelectOptions("promotionFromClass","","جماعت منتخب کریں");
  setSelectOptions("promotionToClass","","اگلی جماعت منتخب کریں");
  setSelectOptions("promotionSelectedToClass","","اگلی جماعت منتخب کریں");
  setSelectOptions("promotionWholeToClass","","اگلی جماعت منتخب کریں");

  App.el("promotionStudentId")?.addEventListener("change",syncSingle);
  App.el("promotionDecision")?.addEventListener("change",syncSingle);

  App.el("promotionSelectedFromClass")?.addEventListener("change",()=>{
    renderSelectedList();
    syncSelectedTarget();
  });
  App.el("promotionSelectedDecision")?.addEventListener("change",syncSelectedTarget);

  App.el("promotionFromClass")?.addEventListener("change",syncWholeTarget);
  App.el("promotionWholeDecision")?.addEventListener("change",syncWholeTarget);

  App.el("promotionSelectAll")?.addEventListener("click",()=>{
    document.querySelectorAll("[data-promotion-student]").forEach(x=>x.checked=true);
    updateSelectedCount();
  });
  App.el("promotionClearAll")?.addEventListener("click",()=>{
    document.querySelectorAll("[data-promotion-student]").forEach(x=>x.checked=false);
    updateSelectedCount();
  });

  const single=App.el("singlePromotionForm");
  if(single){
    single.addEventListener("submit",async e=>{
      e.preventDefault();
      const id=Number(App.val("promotionStudentId"));
      const s=students.find(x=>Number(x.id)===id);
      if(!s){alert("طالبہ منتخب کریں۔");return;}
      const current=App.safe(s.student_class).trim();
      const decision=App.val("promotionDecision")||"promoted";
      const target=decisionTarget(current,decision);
      try{
        ensureValidTarget(current,decision,target);
        if(!window.confirm("کیا آپ "+App.safe(s.name)+" کا ریکارڈ اپڈیٹ کرنا چاہتے ہیں؟\n"+current+" → "+target)) return;
        await App.promoteStudent(
          id,target,
          App.val("promotionAcademicYear"),
          App.val("promotionExamName"),
          App.val("promotionPercentage"),
          decision,
          App.val("promotionNotes")||null
        );
        alert("طالبہ کا سالانہ نتیجہ / جماعت اپڈیٹ ہوگئی۔");
        s.student_class=target;
        single.reset();
        populateStudentSelect();
        syncSingle();
      }catch(error){
        console.error("Single promotion:",error);
        alert(error?.message||"طالبہ کی جماعت اپڈیٹ نہیں ہو سکی۔");
      }
    });
  }

  const selectedBtn=App.el("promoteSelectedStudents");
  if(selectedBtn){
    selectedBtn.addEventListener("click",async()=>{
      const from=App.val("promotionSelectedFromClass");
      const decision=App.val("promotionSelectedDecision")||"promoted";
      const target=decisionTarget(from,decision);
      const ids=Array.from(document.querySelectorAll("[data-promotion-student]:checked"))
        .map(x=>Number(x.value)).filter(Boolean);
      try{
        if(!ids.length) throw new Error("کم از کم ایک طالبہ منتخب کریں۔");
        ensureValidTarget(from,decision,target);
        if(!window.confirm(ids.length+" طالبات اپڈیٹ ہوں گی۔\n"+from+" → "+target+"\nکیا آپ جاری رکھنا چاہتے ہیں؟")) return;
        await App.promoteSelectedStudents(
          ids,target,
          App.val("promotionSelectedAcademicYear"),
          App.val("promotionSelectedExamName"),
          decision,
          App.val("promotionSelectedNotes")||null
        );
        ids.forEach(id=>{const s=students.find(x=>Number(x.id)===id);if(s)s.student_class=target;});
        alert("منتخب طالبات اپڈیٹ ہوگئیں۔");
        renderSelectedList();
      }catch(error){
        console.error("Selected promotion:",error);
        alert(error?.message||"منتخب طالبات اپڈیٹ نہیں ہو سکیں۔");
      }
    });
  }

  const whole=App.el("wholeClassPromotionForm");
  if(whole){
    whole.addEventListener("submit",async e=>{
      e.preventDefault();
      const from=App.val("promotionFromClass");
      const decision=App.val("promotionWholeDecision")||"promoted";
      const target=decisionTarget(from,decision);
      const count=students.filter(s=>App.safe(s.student_class).trim()===from).length;
      try{
        if(!from) throw new Error("موجودہ جماعت منتخب کریں۔");
        if(!count) throw new Error("اس جماعت میں کوئی طالبہ موجود نہیں۔");
        ensureValidTarget(from,decision,target);
        if(!window.confirm("پوری جماعت کی "+count+" طالبات اپڈیٹ ہوں گی۔\n"+from+" → "+target+"\nکیا آپ واقعی جاری رکھنا چاہتے ہیں؟")) return;
        await App.promoteWholeClass(
          from,target,
          App.val("promotionWholeAcademicYear"),
          App.val("promotionWholeExamName"),
          decision,
          App.val("promotionWholeNotes")||null
        );
        students.forEach(s=>{if(App.safe(s.student_class).trim()===from)s.student_class=target;});
        alert("پوری جماعت کا سالانہ ریکارڈ اپڈیٹ ہوگیا۔");
        whole.reset();
        syncWholeTarget();
        populateStudentSelect();
        renderSelectedList();
      }catch(error){
        console.error("Whole promotion:",error);
        alert(error?.message||"کلاس اپڈیٹ نہیں ہو سکی۔");
      }
    });
  }
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,0),{once:true});
}else{
  setTimeout(boot,0);
}
})();