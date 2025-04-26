const sheets = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS2vKY3pDUlqMTYsbWAyKT99oqaJVF3ihcf5n-EgImacGmTapw2DFsVPM37rsauseCaSPMDc4s3sfOn/pub?output=csv";
const response = await fetch(sheets);
const csvText = await response.text();

const sanitizeName = (name) => {
  const accentsMap = new Map([ ['á', 'a'], ['à', 'a'], ['â', 'a'], ['ä', 'a'], ['ã', 'a'], ['å', 'a'], ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'], ['í', 'i'], ['ì', 'i'], ['î', 'i'], ['ï', 'i'], ['ó', 'o'], ['ò', 'o'], ['ô', 'o'], ['ö', 'o'], ['õ', 'o'], ['ø', 'o'], ['ú', 'u'], ['ù', 'u'], ['û', 'u'], ['ü', 'u'], ['ý', 'y'], ['ÿ', 'y'], ['ñ', 'n'], ['ç', 'c'] ]);
  let sanitized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  sanitized = Array.from(sanitized).map(char => accentsMap.get(char) || char).join('');
  return sanitized.replace(/[^A-Za-z0-9_\-]/g, '_');
};


/**
 * Convertit une chaîne CSV en objet JSON en utilisant ES6
 * @param {string} csvString - La chaîne CSV à convertir
 * @returns {Array} - Tableau d'objets représentant les données CSV
 */
const csvToJson = (csvString) => {
  try {
    const lines = [];
    let currentLine = '';
    let insideQuotes = false;
    
    for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if (char === '\n' && !insideQuotes) {
        lines.push(currentLine);
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    const headers = lines[0].split(',').map(header => header.trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      values.push(currentValue);
      
      const obj = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        value = value.replace(/\r/g, '');

        if (value.includes('\n')) {
          value = value.split('\n').map(line => `<p>${line.trim()}</p>`).join('');
        }
        
        obj[header] = value;
      });
      
      result.push(obj);
    }
    
    return result;
  } catch (error) {
    console.error("Erreur lors de la conversion CSV en JSON:", error);
    return [];
  }
};



const bgColors = ["red", "blue","gray","green","yellow","purple","orange","pink","brown","black","white"];

const json = csvToJson(csvText);

// console.log(json);


const $projets = document.querySelector(".projets");

// parcourir le json et créer les éléments
json.forEach((item) => {
  const div = document.createElement("div");
  div.classList.add("projet");
  $projets.appendChild(div);
 
  // const img = document.createElement("img");
  // img.src = `img/${sanitizeName(item.titre)}.png`;
  // div.appendChild(img);


  const titre = document.createElement("h1");
  titre.textContent = item.titre;
  div.appendChild(titre);

  // const categories = document.createElement("div");
  // categories.textContent = item.catégories;
  // div.appendChild(categories);

  // const description = document.createElement("p");
  // description.textContent = item.description;
  // div.appendChild(description);

  div.addEventListener("click", () => {
    const header = document.querySelector("header");
    header.classList.add("fixed");

    const projets = document.querySelector(".projets");
    projets.classList.add("fixed");

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    const wrap = document.createElement("div");
    wrap.classList.add("wrap");
    overlay.appendChild(wrap);

    const fiche = document.createElement("div");
    fiche.classList.add("fiche");
    wrap.appendChild(fiche);

    const close = document.createElement("div");
    close.textContent = "×";
    close.classList.add("close");
    overlay.appendChild(close);




    // amélioration de la fermeture de la fiche
    overlay.addEventListener("click", (e) => {
      if (e.target === fiche || fiche.contains(e.target)) return;
      gsap.to(overlay, {opacity: 0, duration: 0.2, onComplete: () => overlay.remove()});
      header.classList.remove("fixed");
      projets.classList.remove("fixed");
    });


    const titre = document.createElement("h1");
    titre.textContent = item.titre;
    fiche.appendChild(titre);

    // Ajouter la description dans la fiche
const description = document.createElement("p");
description.innerHTML = item.description;
fiche.appendChild(description);

const img = document.createElement("img");
img.src = `img/${sanitizeName(item.titre)}.png`;
fiche.appendChild(img);

    const desc = document.createElement("div");
    desc.innerHTML = item.modale;
    fiche.appendChild(desc);

    if(item.images !== "") {
      const images = item.images.split(",");
      const gallery = document.createElement("div");
      gallery.classList.add("img-container"); // 
    
      images.forEach((image) => {
        const img = document.createElement("img");
        const name = sanitizeName(item.titre);
        img.src = `img/${name}/${image}`;
        img.classList.add("img"); //  ici tu mets la bonne classe pour chaque image
        gallery.appendChild(img);
      });
    
      fiche.appendChild(gallery);
    }


    // gsap.from(fiche, {opacity: 0, duration: 0.4});
    // gsap.from(overlay, {opacity: 0, duration: 0.4});
  });


});


/***************************************************************/

// base pour le plugin motionPath
gsap.registerPlugin(MotionPathPlugin);

// position initiale des projets
gsap.set(".projet", {
  opacity: 0,
  y: 300,
  paddingTop: "100px",
});

// animation pour faire apparaître les projets en colonne
gsap.to(".projet", {
  opacity: 1,
  y: 0,
  duration: 0.2,
  stagger: {
    each: 0.2,
  },
  ease: "power2.out",
});

  // Ajouter un effet de survol pour déplacer les projets légèrement vers la droite
  document.querySelectorAll(".projet").forEach((projet) => {
    projet.addEventListener("mouseenter", () => {
      gsap.to(projet, {
        x: "+=20", // Déplacement relatif vers la droite
        duration: 0.3,
        ease: "power2.out",
      });
      projet.classList.add("hovered"); // Marquer comme survolé
    });

    projet.addEventListener("mouseleave", () => {
      gsap.to(projet, {
        x: "-=20", // Retour à la position initiale
        duration: 0.2,
        ease: "power2.out",
      });
      projet.classList.remove("hovered"); // Retirer la marque de survol
    });
  });

// Fonction pour déplacer les projets sur leur ligne de manière aléatoire
const moveProjectsRandomly = () => {
  document.querySelectorAll(".projet").forEach((projet, index) => {
    if (!projet.classList.contains("hovered")) { // Ne pas déplacer si survolé

      const randomX = Math.random() * (window.innerWidth - 60) - 60; // Position X aléatoire avec marges de 30px
      const currentY = gsap.getProperty(projet, "y"); // Récupérer la position Y actuelle

      gsap.to(projet, {
        x: randomX,
        y: currentY, // Garder la position Y fixe
        duration: 1, // Durée de l'animation
        ease: "power1.inOut",
      });
    }
  });
};


// Déplacer les projets aléatoirement toutes les 3 secondes
setInterval(moveProjectsRandomly, 2000);

// Ajouter un effet de survol pour changer la couleur du titre en rouge
document.querySelectorAll(".projet h1").forEach((titre) => {
  titre.addEventListener("mouseenter", () => {
    gsap.to(titre, {
      color: "red", // Changer la couleur en rouge
      ease: "power2.out",
    });
  });

  titre.addEventListener("mouseleave", () => {
    gsap.to(titre, {
      color: "white", // Revenir à la couleur blanche
      ease: "power2.out",
    });
  });
});


