/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close')

/* Menu show */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu')
    })
}

/* Menu hidden */
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu')
    })
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () => {
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*=============== ADD BLUR HEADER ===============*/
const blurHeader = () => {
    const header = document.getElementById('header')
    // Add a class if the bottom offset is greater than 50 of the viewport
    this.scrollY >= 50 ? header.classList.add('blur-header')
        : header.classList.remove('blur-header')
}
window.addEventListener('scroll', blurHeader)


/*=============== EMAIL JS ===============*/
const contactForm = document.getElementById('contact-form'),
      contactMessage = document.getElementById('contact-message'),
      nameInput = document.querySelector("input[name='user_name']"),
      emailInput = document.querySelector("input[name='user_email']"),
      messageInput = document.querySelector("textarea[name='user_message']");

const sendEmail = (e) => {
    e.preventDefault();

    // Trim input values
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    // Basic email validation regex
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let hasError = false;

    // Reset previous styles
    nameInput.classList.remove("error");
    emailInput.classList.remove("error");
    messageInput.classList.remove("error");

    // Check if fields are empty
    if (name === "") {
        nameInput.classList.add("error");
        hasError = true;
    }
    if (email === "" || !emailPattern.test(email)) {
        emailInput.classList.add("error");
        hasError = true;
    }
    if (message === "") {
        messageInput.classList.add("error");
        hasError = true;
    }

    if (hasError) {
        contactMessage.textContent = "❌ Please fill in all required fields correctly.";
        contactMessage.classList.add("error");
        setTimeout(() => { contactMessage.textContent = ""; }, 5000);
        return; // Stop form submission
    }

    // If validation passes, send the email
    emailjs.sendForm('service_v0yvpg5', 'template_1qdt58c', '#contact-form', '50jspKStyBIdh91No')
        .then(() => {
            contactMessage.textContent = '✅ Message sent successfully!';
            contactMessage.classList.add("success");

            setTimeout(() => { contactMessage.textContent = ''; }, 5000);
            contactForm.reset();
        }, () => {
            contactMessage.textContent = '❌ Message not sent (service error).';
            contactMessage.classList.add("error");

            setTimeout(() => { contactMessage.textContent = ''; }, 5000);
        });
};

// Attach event listener
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
    duration: 1500,
    delay: 200,
    // reset: true // Animations repeat
})


sr.reveal(`.home__data, .experience, .education, .skills, .contact__container`)
sr.reveal(`.home__img`, {delay: 600})
sr.reveal(`.home__scroll`, {delay: 800})
sr.reveal(`.work__card, .projects__card`, {interval: 100})
sr.reveal(`.about__content`, {origin: 'right'})
sr.reveal(`.about__img`, {origin: 'left'})
