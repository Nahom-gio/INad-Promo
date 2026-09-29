const WEB3FORMS_ENDPOINT='https://api.web3forms.com/submit';

async function handleForm(e){
  e.preventDefault();

  const form=e.target;
  const btn=form.querySelector('.cf-submit');
  const status=document.getElementById('cfsuccess');
  const defaultText='Send the brief \u2192';

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

    status.textContent='\u2713 Thank you \u2014 your message has been sent.';
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
  const form=document.getElementById('cform');
  const date=new Date();
  const number=`${String(date.getFullYear()).slice(2)}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*900)+100)}`;
  const numberEl=document.getElementById('ticketNumber');
  const dateEl=document.getElementById('ticketDate');
  if(numberEl) numberEl.textContent=`N° ${number}`;
  if(dateEl) dateEl.textContent=date.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  form?.addEventListener('submit',handleForm);
}
