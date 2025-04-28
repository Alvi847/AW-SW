
document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById('toggle-button');
    const hiddenCards = document.querySelectorAll('.hidden-fav');
    const chevronIcon = document.getElementById('icon-chevron');

    let expanded = false;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            expanded = !expanded;

            hiddenCards.forEach(card => {
                card.style.display = expanded ? 'block' : 'none';
            });

            // Rotar el icono
            chevronIcon.classList.toggle('rotado', expanded);
        });
    }
});