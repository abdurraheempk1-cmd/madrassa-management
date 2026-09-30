(function(){
"use strict";
const App=window.App;
if(!App) return;

App.publicVerificationUrl=function(token){
  const clean=App.safe(token).trim();
  if(!clean) return "";
  const url=new URL("verify.html",window.location.href);
  url.searchParams.set("t",clean);
  return url.href;
};

App.getPublicVerificationToken=async function(ownerType,ownerId){
  if(ownerType!=="student") return null;
  return App.authedRpc("admin_get_or_create_id_card_verification",{
    p_owner_type:"student",
    p_owner_id:Number(ownerId)
  });
};

App.idCardQrUrl=function(record,type="student"){
  if(type!=="student") return "";
  const token=App.safe(
    record?.__publicVerificationToken ||
    record?.verification_token ||
    record?.public_verification_token ||
    ""
  ).trim();
  return token ? App.publicVerificationUrl(token) : "";
};

App.renderIdCardQrCodes=function(){
  document.querySelectorAll("[data-id-card-qr]").forEach(node=>{
    const url=App.safe(node.dataset.idCardQr).trim();
    node.innerHTML="";
    if(!url){node.textContent="QR دستیاب نہیں";return;}
    if(typeof window.QRCode!=="function"){
      node.innerHTML='<span class="id-card-qr-fallback">QR لوڈ نہیں ہوا</span>';
      return;
    }
    try{
      new window.QRCode(node,{
        text:url,
        width:180,
        height:180,
        colorDark:"#000000",
        colorLight:"#ffffff",
        correctLevel:window.QRCode.CorrectLevel.L
      });

      /* qrcodejs may create BOTH a canvas and a helper img.
         On the previous card CSS both became visible inside a flex box,
         which made the printed QR look like "half one QR + half another".
         Keep exactly one rendered QR surface. */
      requestAnimationFrame(function(){
        const canvas=node.querySelector("canvas");
        const img=node.querySelector("img");

        if(canvas){
          canvas.style.setProperty("display","block","important");
          canvas.style.setProperty("margin","0 auto","important");
          if(img){
            img.style.setProperty("display","none","important");
          }
        }else if(img){
          img.style.setProperty("display","block","important");
          img.style.setProperty("margin","0 auto","important");
        }
      });

      /* QRCode.js creates both canvas and img. Keep only the final image visible. */
      node.querySelectorAll("canvas").forEach(canvas => {
        canvas.style.setProperty("display","none","important");
      });
      node.querySelectorAll("img").forEach(img => {
        img.style.setProperty("display","block","important");
      });
    }catch(error){
      console.error("Student card QR:",error);
      node.innerHTML='<span class="id-card-qr-fallback">QR تیار نہیں ہوا</span>';
    }
  });
};

App.idCardFrontHtml=function(item){
  const record=item.record||{};
  const type=item.type||"student";
  const role=App.idCardRoleLabel(type);
  const reference=App.idCardRecordReference(type,record);
  const name=App.idCardRecordName(record,role);
  const father=App.safe(record.father_name);
  const klass=type==="student"
    ? App.safe(record.student_class)
    : App.safe(record.teaching_class||record.qualification||record.designation||record.username);

  /* Girls/female students: never show a photo.
     Male teacher/admin: show a photo only when one exists. */
  const photo=type==="student" ? "" : App.safe(
    record.photo_url ||
    record.profile_photo_url ||
    record.profile_photo ||
    record.photo ||
    ""
  ).trim();
  const photoHtml=photo
    ? '<div class="id-card-person-photo"><img src="'+App.escape(photo)+'" alt="'+App.escape(name)+'"></div>'
    : '';

  return '<article class="id-card id-card-front">' +
    '<div class="id-card-front-head">' +
      '<div class="id-card-mark"><span>ش</span><span>ا</span></div>' +
      '<div class="id-card-head-copy"><strong>'+App.escape(App.NAME)+'</strong><small>'+App.escape(App.ADDRESS)+'</small></div>' +
      '<div class="id-card-type-chip">'+App.escape(role)+'</div>' +
    '</div>' +
    '<div class="id-card-front-body '+(photo?'has-photo':'no-photo')+'">' +
      photoHtml +
      '<div class="id-card-main-info">' +
        '<div class="id-card-title-line">'+App.escape(App.idCardDisplayTitle(type))+'</div>' +
        '<h3>'+App.escape(name)+'</h3>' +
        '<div class="id-card-info-grid">' +
          (father?'<div><span>والد کا نام</span><strong>'+App.escape(father)+'</strong></div>':'') +
          (klass?'<div><span>'+(type==="student"?'جماعت':'تدریسی معلومات')+'</span><strong>'+App.escape(klass)+'</strong></div>':'') +
          '<div class="id-card-info-wide id-card-admission-line"><span>'+(type==="student"?'وفاق / داخلہ نمبر':type==="teacher"?'استاد کوڈ':'صارف')+'</span><strong data-no-translate>'+App.escape(reference)+'</strong></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="id-card-validity-row id-card-validity-single"><div><span>جاری ہونے کی تاریخ</span><strong>'+App.escape(App.date(item.issueDate))+'</strong></div></div>' +
    '<div class="id-card-number-strip"><span>کارڈ نمبر</span><strong data-no-translate>'+App.escape(App.formatStudentCardNumber(record,item.cardNo))+'</strong></div>' +
  '</article>';
};

App.idCardBackHtml=function(item){
  const record=item.record||{};
  const type=item.type||"student";
  const studentPhone=App.safe(record.phone)||"—";
  const studentAddress=App.safe(record.address)||"—";
  const qrUrl=App.idCardQrUrl(record,type);

  return '<article class="id-card id-card-back">' +
    '<div class="id-card-back-head"><strong>'+App.escape(App.NAME)+'</strong><span>تفصیل و تصدیق</span></div>' +
    '<div class="id-card-back-content id-card-back-with-qr">' +
      '<div class="id-card-back-details">' +
        '<div class="id-card-back-field id-card-back-field-wide"><span>'+(type==="student"?'طالبہ کا پتہ':'پتہ')+'</span><strong>'+App.escape(studentAddress)+'</strong></div>' +
        '<div class="id-card-back-field"><span>رابطہ نمبر</span><strong data-no-translate>'+App.escape(studentPhone)+'</strong></div>' +
        '<div class="id-card-back-field"><span>مدرسہ رابطہ نمبر</span><strong data-no-translate>'+App.escape(App.MADRASSA_PHONE)+'</strong></div>' +
        (item.expiryDate?'<div class="id-card-back-field id-card-back-field-wide"><span>میعاد ختم ہونے کی تاریخ</span><strong>'+App.escape(App.date(item.expiryDate))+'</strong></div>':'') +
      '</div>' +
      (qrUrl
        ? '<div class="id-card-qr-panel id-card-qr-only"><div class="id-card-qr" data-id-card-qr="'+App.escape(qrUrl)+'"></div></div>'
        : '') +
    '</div>' +
    '<div class="id-card-back-footer id-card-back-footer-single"><div><span>کارڈ نمبر</span><strong data-no-translate>'+App.escape(App.formatStudentCardNumber(record,item.cardNo))+'</strong></div></div>' +
  '</article>';
};

App.registerAndPreviewIdCards=async function(type,ids,button=null){
  const dates=App.idCardDates();
  const records=await App.loadIdCardRecords(type);
  const selected=Array.from(new Set((ids||[]).map(Number).filter(Boolean)))
    .map(id=>records.find(record=>Number(record.id)===id))
    .filter(Boolean);
  if(!selected.length) throw new Error("کوئی ریکارڈ منتخب نہیں کیا گیا۔");

  const oldText=button?.textContent||"";
  const output=[];
  if(button) button.disabled=true;
  try{
    for(let index=0;index<selected.length;index+=1){
      const original=selected[index];
      if(button) button.textContent="تیار ہو رہا ہے "+(index+1)+"/"+selected.length;
      const result=await App.registerIdCard(type,Number(original.id));
      const systemCardNo=App.idCardResultCardNo(result);

      let verificationToken="";
      if(type==="student"){
        try{
          const tokenResult=await App.getPublicVerificationToken("student",Number(original.id));
          verificationToken=App.safe(tokenResult?.token||tokenResult?.verification_token).trim();
        }catch(error){
          console.error("Public QR token:",error);
          const detail = App.safe(error?.message || error?.details || error?.hint || "").trim();
          throw new Error("QR تصدیق تیار نہیں ہو سکی۔" + (detail ? "\n" + detail : ""));
        }
      }

      const record=Object.assign({},original,{__publicVerificationToken:verificationToken});
      output.push({
        type,
        record,
        cardNo:App.idCardCompositeNumber(record,type,systemCardNo),
        systemCardNo:systemCardNo||null,
        issueDate:dates.issueDate,
        expiryDate:dates.expiryDate
      });
    }
    App.renderIdCardPreview(output);
    return output;
  }finally{
    if(button){button.disabled=false;button.textContent=oldText;}
  }
};

App.initPublicStudentVerification=async function(){
  if((App.currentFile||"").toLowerCase()!=="verify.html") return;
  const token=App.safe(new URLSearchParams(window.location.search).get("t")).trim();
  const loading=App.el("verificationLoading");
  const errorBox=App.el("verificationError");
  const content=App.el("verificationContent");

  if(!token){
    App.hide(loading);
    App.show(errorBox);
    App.setText("verificationError","QR لنک درست نہیں ہے۔");
    return;
  }

  try{
    const data=await App.rpc("public_get_student_id_card_verification",{p_verification_token:token});
    if(!data||!data.name) throw new Error("Record not found");

    App.setText("verifyStudentName",data.name);
    App.setText("verifyFatherName",data.father_name);
    App.setText("verifyWifaqNumber",data.wifaq_number||data.admission_no);
    App.setText("verifyCNIC",data.cnic?App.formatCNIC(data.cnic):"—");
    App.setText("verifyPhone",data.phone);
    App.setText("verifyClass",data.student_class);
    App.setText("verifyDOB",App.date(data.date_of_birth));
    App.setText("verifyAddress",data.address);

    const mahramBox=App.el("verifyMahrams");
    const mahrams=App.asArray(data.mahrams);
    if(mahramBox){
      mahramBox.innerHTML=mahrams.length
        ? mahrams.map(m=>
          '<article class="verification-mahram-card">'+
            '<div><span>محرم کا نام</span><b data-no-translate>'+App.escape(m?.name||m?.mahram_name||"—")+'</b></div>'+
            '<div><span>رشتہ</span><b>'+App.escape(m?.relation||"—")+'</b></div>'+
            '<div><span>شناختی کارڈ / ب فارم</span><b dir="ltr" data-no-translate>'+App.escape(m?.cnic?App.formatCNIC(m.cnic):"—")+'</b></div>'+
            '<div><span>فون نمبر</span><b dir="ltr" data-no-translate>'+App.escape(m?.phone||"—")+'</b></div>'+
          '</article>'
        ).join("")
        : App.empty("محرم کی معلومات موجود نہیں۔");
    }

    App.hide(loading);
    App.hide(errorBox);
    App.show(content);
  }catch(error){
    console.error("Public verification:",error);
    App.hide(loading);
    App.show(errorBox);
    App.setText("verificationError","ریکارڈ موجود نہیں یا QR درست نہیں ہے۔");
  }
};

function bootPublicVerification(){
  if((App.currentFile||"").toLowerCase()==="verify.html"){
    setTimeout(()=>App.initPublicStudentVerification(),0);
  }
}

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",bootPublicVerification,{once:true});
}else{
  bootPublicVerification();
}
})();