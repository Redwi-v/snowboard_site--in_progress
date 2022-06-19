import './webp-test';
import './header/search';
import './header/menuBurger';
import './sliders';

class CreateAcardionSet {
	constructor(id, singleMode = false) {
		this.buttons = document.querySelectorAll(`[data-acardion="${id}"]`);
		this.lists = [];

		this.#createAcardion(singleMode);
	}

	#isSingelMode() {
		this.lists.forEach(list => {
			list.style.maxHeight = 0;
			list.classList.remove('active');
		});
	}

	#createAcardion(singleMode) {
		this.buttons.forEach(btn => {
			const list = btn.nextElementSibling;
			this.lists.push(list);

			btn.addEventListener('click', () => {
				list.classList.toggle('active');

				if (list.classList.contains('active')) {
					//скрывает остальные спски при singleMode === true
					singleMode && this.#isSingelMode();

					list.style.maxHeight = list.scrollHeight + 'px';
					list.classList.add('active');
				} else {
					list.style.maxHeight = 0;
				}
			});
		});
	}
}

new CreateAcardionSet('123', true);
