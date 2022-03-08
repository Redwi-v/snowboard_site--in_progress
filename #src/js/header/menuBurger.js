const btn = document.querySelector('.menu-burger__btn');
const menu = document.querySelector('.menu-burger__nav-bar');

btn.addEventListener('click', () => {
	btn.classList.toggle('active');
	menu.classList.toggle('active');
	document.body.classList.toggle('hiden');
});
