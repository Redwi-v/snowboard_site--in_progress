import { send } from '../Api/Api';

const serchBtns = document.querySelectorAll('#serchBtn');
const headerSerchForm = '#headerSerchForm';

serchBtns.forEach(btn => {
	btn.addEventListener('click', e => {
		e.preventDefault();

		// находим ближайший input для кнопки
		const serchInput = e.target.closest(headerSerchForm).querySelector('input');

		const { value } = serchInput;

		!value ? serchInput.classList.toggle('active_serch') : send(value);

		serchInput.value = '';
	});
});
