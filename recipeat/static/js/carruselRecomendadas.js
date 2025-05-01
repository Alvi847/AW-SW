document.addEventListener("DOMContentLoaded", function () {
    const track = document.getElementById('recomendadasTrack');
    const btnLeft = document.querySelector('.carrusel-btn.left');
    const btnRight = document.querySelector('.carrusel-btn.right');
    const carrusel = document.querySelector('.recomendadas-carrusel');

    const cardWidth = track.querySelector('.receta-recomendada-card')?.offsetWidth || 300;
    let autoplayTimer;

    function moveLeft() {
        track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }

    function moveRight() {
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 5) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
    }

    function startAutoplay() {
        autoplayTimer = setInterval(moveRight, 5000);
    }

    function stopAutoplay() {
        clearInterval(autoplayTimer);
    }

    btnLeft.addEventListener('click', () => {
        moveLeft();
        stopAutoplay();
        startAutoplay();
    });

    btnRight.addEventListener('click', () => {
        moveRight();
        stopAutoplay();
        startAutoplay();
    });

    carrusel.addEventListener('mouseenter', stopAutoplay);
    carrusel.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
});
