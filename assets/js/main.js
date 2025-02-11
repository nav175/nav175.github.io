/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close')

/* Menu show */
if(navToggle){
    navToggle.addEventListener('click', () =>{
        navMenu.classList.add('show-menu')
    })
}

/* Menu hidden */
if(navClose){
    navClose.addEventListener('click', () =>{
        navMenu.classList.remove('show-menu')
    })
}

/*=============== EMAIL JS ===============*/
const contactForm = document.getElementById('contact-form'),
      contactMessage = document.getElementById('contact-message');

const sendEmail = (e) => {
    e.preventDefault();

    // serviceID - templateID - #form - publicKey
    emailjs.sendForm('service_v0yvpg5', 'template_1qdt58c', '#contact-form', '50jspKStyBIdh91No')
        .then(() => {
            // Show sent message
            contactMessage.textContent = 'Message sent successfully ✅';

            // Remove message after five seconds
            setTimeout(() => {
                contactMessage.textContent = '';
            }, 5000);

            // Clear input fields
            contactForm.reset();
        }, () => {
            // Show error message
            contactMessage.textContent = 'Message not sent (service error) ❌';

            // Remove message after five seconds
            setTimeout(() => {
                contactMessage.textContent = '';
            }, 5000);

        });
};

contactForm.addEventListener('submit', sendEmail);

/*=============== SHOW SCROLL UP ===============*/ 
const scrollUp = () =>{
	const scrollUp = document.getElementById('scroll-up')
    // When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
	this.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
						: scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]')
    
const scrollActive = () =>{
  	const scrollDown = window.scrollY

	sections.forEach(current =>{
		const sectionHeight = current.offsetHeight,
			  sectionTop = current.offsetTop - 58,
			  sectionId = current.getAttribute('id'),
			  sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')

		if(scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight){
			sectionsClass.classList.add('active-link')
		}else{
			sectionsClass.classList.remove('active-link')
		}                                                    
	})
}
window.addEventListener('scroll', scrollActive)

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2500,
    delay: 400,
    // reset: true // Animations repeat
})

sr.reveal(`.home__data, .experience, .skills, .contact__contaner`)
sr.reveal(`.home__img`, {delay: 600})
sr.reveal(`.home__scroll`, {delay: 800})
sr.reveal(`.work__card, services__card`, {interval: 100})
sr.reveal(`.about__content`, {origin: 'right'})
sr.reveal(`.about__img`, {origin: 'left'})