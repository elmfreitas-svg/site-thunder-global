// ================================
// 🔥 THUNDER GLOBAL CORPORATION
// script.js — versão segura e otimizada (envios multipart)
// ================================

document.addEventListener('DOMContentLoaded', () => {
    const modalTrabalhe = document.getElementById('trabalheModal');
    console.log(modalTrabalhe);
});

document.addEventListener('DOMContentLoaded', () => {

    /** ==========================
     *  MENU MOBILE
     * ========================== **/
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', () => menu.classList.toggle('active'));
    }

    /** ==========================
     *  MODAL — TRABALHE CONOSCO
     * ========================== **/
    const openTrabalheHeader = document.getElementById('openTrabalheHeader');
    const modalTrabalhe = document.getElementById('trabalheModal');
    const tcFecharTop = document.getElementById('tcFecharTop');

    if (openTrabalheHeader && modalTrabalhe) {
        openTrabalheHeader.addEventListener('click', () => {
            modalTrabalhe.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    }

    if (tcFecharTop) {
        tcFecharTop.addEventListener('click', () => {
            modalTrabalhe.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }

    if (modalTrabalhe) {
        modalTrabalhe.addEventListener('click', (e) => {
            if (e.target === modalTrabalhe || e.target.classList.contains('bg-opacity-80')) {
                modalTrabalhe.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }

    /** ==========================
     *  MODAL — AGENDAR REUNIÃO
     * ========================== **/
    const openModalBtn = document.getElementById('openModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modal = document.getElementById('modal');

    if (openModalBtn && modal) {
        openModalBtn.addEventListener('click', e => {
            e.preventDefault();
            modal.classList.remove('hidden');
        });
    }

    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
        window.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
    }

  /** ==========================
   *  ENVIO DE AGENDAMENTO — SERVIDOR (corrigido para multipart/form-data)
   * ========================== **/
const btnEmail = document.getElementById("btnEmail");

if (btnEmail) {
  btnEmail.addEventListener("click", async (e) => {
    e.preventDefault();

    const form = document.getElementById("agendaForm"); // ID do formulário de agendamento
    if (!form) return alert("Formulário não encontrado.");

    try {
      const formData = new FormData(form); // captura todos os campos do formulário
      const response = await fetch("/.netlify/functions/sendEmail", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        alert("✅ Agendamento enviado com sucesso! Nossa equipe entrará em contato.");
        form.reset();
        modal?.classList.add('hidden');
      } else {
        const errorText = await response.text();
        alert("❌ Erro ao enviar o agendamento: " + errorText);
      }
    } catch (err) {
      console.error("Erro ao enviar agendamento:", err);
      alert("❌ Falha na conexão com o servidor.");
    }
  });
}

    /** ==========================
     *  ENVIO DE AGENDAMENTO — WHATSAPP
     * ========================== **/
    window.enviarWhatsApp = function() {
        const nome = encodeURIComponent(document.getElementById('nome').value);
        const telefone = encodeURIComponent(document.getElementById('telefone').value);
        const empresa = encodeURIComponent(document.getElementById('empresa').value);
        const obs = encodeURIComponent(document.getElementById('observacoes').value);

        const mensagem = encodeURIComponent(
            `Olá, gostaria de agendar uma reunião executiva.\n` +
            `Nome: ${decodeURIComponent(nome)}\n` +
            `Telefone: ${decodeURIComponent(telefone)}\n` +
            `Empresa: ${decodeURIComponent(empresa)}\n` +
            `Observações: ${decodeURIComponent(obs)}`
        );

        window.open(`https://wa.me/5511951138478?text=${mensagem}`, '_blank');
    };

    const btnWhatsApp = document.getElementById('btnWhatsApp');
    if (btnWhatsApp) {
        btnWhatsApp.addEventListener('click', (e) => {
            e.preventDefault();
            enviarWhatsApp();
        });
    }

    /** ==========================
     *  TRABALHE CONOSCO — Envio via Netlify Functions
     * ========================== **/
    const form = document.getElementById("trabalheForm");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            try {
                const formData = new FormData(form); // captura campos + arquivo
                const response = await fetch("/.netlify/functions/sendToRH", {
                    method: "POST",
                    body: formData
                });

                if (response.ok) {
                    alert("✅ Formulário enviado com sucesso! Obrigado por se candidatar à Thunder Global.");
                    form.reset();
                } else {
                    const respText = await response.text();
                    alert("❌ Erro ao enviar o formulário: " + respText);
                }
            } catch (error) {
                console.error("Erro de rede:", error);
                alert("❌ Erro de conexão com o servidor.");
            }
        });
    }

    /** ==========================
     *  SMOOTH SCROLL
     * ========================== **/
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    /** ==========================
     *  COMPANY CARDS ANIMATION
     * ========================== **/
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
    const observer = new IntersectionObserver(entries => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.company-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(card);
    });

    /** ==========================
     *  PARALLAX LOGO
     * ========================== **/
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelectorAll('.floating-logo');
        const speed = 0.5;
        parallax.forEach(element => {
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });

    /** ==========================
     *  POLÍTICA DE PRIVACIDADE
     * ========================== **/
    const linkPolitica = document.getElementById('linkPolitica');
    if (linkPolitica) {
        linkPolitica.addEventListener('click', e => {
            e.preventDefault();
            renderPoliticaPrivacidade();
        });
    }
});

(function() {
  function initTrabalheConosco() {
    const openBtn = document.getElementById('openTrabalheHeader') || document.querySelector('[data-open-trabalhe="true"]');
    const modal = document.getElementById('trabalheModal') || document.querySelector('.trabalhe-modal');
    const closeTop = document.getElementById('tcFecharTop');
    const closeBottom = document.getElementById('tcFecharBottom');

    console.log('[DEBUG] initTrabalheConosco:', { openBtn, modal, closeTop, closeBottom });

    if (!openBtn) {
      console.warn('Botão "openTrabalheHeader" não encontrado no DOM.');
      return;
    }
    if (!modal) {
      console.warn('Modal "trabalheModal" não encontrado no DOM.');
      return;
    }

    const openHandler = (e) => {
      e && e.preventDefault && e.preventDefault();
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      console.log('[DEBUG] abriu modal Trabalhe Conosco');
    };

    const closeHandler = (e) => {
      e && e.preventDefault && e.preventDefault();
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      console.log('[DEBUG] fechou modal Trabalhe Conosco');
    };

    openBtn.removeEventListener('click', openHandler);
    openBtn.addEventListener('click', openHandler);

    if (closeTop) {
      closeTop.removeEventListener('click', closeHandler);
      closeTop.addEventListener('click', closeHandler);
    }
    if (closeBottom) {
      closeBottom.removeEventListener('click', closeHandler);
      closeBottom.addEventListener('click', closeHandler);
    }

    modal.removeEventListener('click', modalBackdropHandler);
    modal.addEventListener('click', modalBackdropHandler);

    function modalBackdropHandler(e) {
      if (e.target === modal || e.target.classList.contains('bg-opacity-80')) {
        closeHandler();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrabalheConosco);
  } else {
    initTrabalheConosco();
  }
})();
