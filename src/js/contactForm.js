const WEB3FORMS_ENDPOINT='https://api.web3forms.com/submit';

async function handleForm(e){
  e.preventDefault();

  const form=e.target;
  const btn=form.querySelector('.cf-submit');
  const status=document.getElementById('cfsuccess');
  const defaultText='Send Message \u2197';

  status.style.display='none';
  status.classList.remove('is-error');
  btn.textContent='Sending\u2026';
  btn.disabled=true;

  try{
    const response=await fetch(WEB3FORMS_ENDPOINT,{
      method:'POST',
      body:new FormData(form),
      headers:{Accept:'application/json'},
    });
    const result=await response.json();

    if(!response.ok || !result.success){
      throw new Error(result.message || 'Submission failed');
    }

    status.textContent='\u2713 Thank you \u2014 we will be in touch within 24 hours.';
    status.style.display='block';
    btn.textContent='Message Sent \u2713';
    form.reset();
  }catch(error){
    status.textContent='Message could not be sent. Please call us or try again.';
    status.classList.add('is-error');
    status.style.display='block';
    btn.textContent=defaultText;
  }finally{
    btn.disabled=false;
  }
}

export function initContactForm(){
  document.getElementById('cform')?.addEventListener('submit',handleForm);

  window.handleForm=handleForm;
}
