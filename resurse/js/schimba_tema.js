window.addEventListener("DOMContentLoaded", function() {
    const checkboxTema = document.getElementById("switch-tema");
    const iconTema = document.getElementById("icon-tema");

    // 1. Verificam daca utilizatorul a avut anterior tema dark salvata in browser
    const temaActiva = localStorage.getItem("tema");

    if (temaActiva === "dark") {
        document.documentElement.setAttribute("data-tema", "dark");
        if (checkboxTema) checkboxTema.checked = true;
        if (iconTema) {
            iconTema.classList.remove("fa-sun", "text-warning");
            iconTema.classList.add("fa-moon", "text-primary");
        }
    }

    // 2. Comportamentul in momentul in care utilizatorul apasa pe switch
    if (checkboxTema) {
        checkboxTema.onchange = function() {
            if (this.checked) {
                // Activam tema DARK
                document.documentElement.setAttribute("data-tema", "dark");
                localStorage.setItem("tema", "dark");
                
                if (iconTema) {
                    iconTema.classList.remove("fa-sun", "text-warning");
                    iconTema.classList.add("fa-moon", "text-primary");
                }
            } else {
                // Activam tema LIGHT
                document.documentElement.removeAttribute("data-tema");
                localStorage.setItem("tema", "light");
                
                if (iconTema) {
                    iconTema.classList.remove("fa-moon", "text-primary");
                    iconTema.classList.add("fa-sun", "text-warning");
                }
            }
        };
    }
});