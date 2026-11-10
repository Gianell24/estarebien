export function setupContact(){
  const form=document.querySelector('#contact-form'),status=document.querySelector('#contact-status'),submit=form.querySelector('[type="submit"]');
  let ready,stamp;
  const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const prepare=()=>ready||(ready=local?Promise.resolve(false):fetch('api/submit.php?stamp=1',{headers:{Accept:'application/json'},cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{stamp=j.stamp;return !!stamp;}).catch(()=>false));
  function feedback(state,text){form.dataset.kState=state;status.hidden=false;status.textContent=text;status.focus({preventScroll:true});}
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(!form.reportValidity())return;submit.disabled=true;status.hidden=true;
    try{
      if(!await prepare()){feedback('unavailable','El envío aún no está activado. Puedes escribirnos a ruwayproducciones@gmail.com.');return;}
      const data=new FormData(form);data.set('_form','contact');data.set('_page',location.pathname);data.set('_t',stamp);
      const response=await fetch(form.action,{method:'POST',body:data,headers:{Accept:'application/json'}}),result=await response.json();
      if(!response.ok||!result.ok){feedback('error',result.error==='expired'?'Espera unos segundos e inténtalo nuevamente.':'No pudimos enviar tu mensaje. Tus datos siguen aquí para que puedas intentarlo otra vez.');return;}
      form.reset();feedback('sent','Gracias por escribirnos. Tu mensaje ha sido recibido.');
    }catch{feedback('error','No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por correo.');}finally{submit.disabled=false;}
  });return prepare;
}
