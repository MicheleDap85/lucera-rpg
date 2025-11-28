import { useEffect, useState } from "react";

// =======================
//   TILE TYPES
// =======================
const TILE_TYPE = {
  WALL: "WALL",     // mura / fuori città
  GRASS: "GRASS",   // prato / campagna
  ROAD: "ROAD",     // strade / piazze
  CASTLE: "CASTLE", // castello
  DUOMO: "DUOMO",   // piazza Duomo / centro
  VILLA: "VILLA",   // villa comunale / belvedere
  HOUSE: "HOUSE",   // case
  AMPHI: "AMPHI",   // anfiteatro
  NPC: "NPC",
  ENEMY: "ENEMY",   // non più usato sulla mappa, ma lasciato per eventuali usi futuri
};

// dimensioni mappa
const MAP_WIDTH = 60;
const MAP_HEIGHT = 40;

// =======================
//   SIMPLE INTERIORS
// =======================

function createSimpleInterior(width, height, labelType) {
  const map = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => TILE_TYPE.ROAD)
  );

  // bordo mura
  for (let x = 0; x < width; x++) {
    map[0][x] = TILE_TYPE.WALL;
    map[height - 1][x] = TILE_TYPE.WALL;
  }
  for (let y = 0; y < height; y++) {
    map[y][0] = TILE_TYPE.WALL;
    map[y][width - 1] = TILE_TYPE.WALL;
  }

  // "zona speciale" al centro
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  if (labelType === "DUOMO") {
    map[cy][cx] = TILE_TYPE.DUOMO;
  } else if (labelType === "CASTLE") {
    map[cy][cx] = TILE_TYPE.CASTLE;
  } else if (labelType === "VILLA") {
    map[cy][cx] = TILE_TYPE.VILLA;
  } else if (labelType === "AMPHI") {
    map[cy][cx] = TILE_TYPE.AMPHI;
  }

  return map;
}

const DUOMO_INTERIOR = createSimpleInterior(12, 8, "DUOMO");
const CASTLE_INTERIOR = createSimpleInterior(14, 9, "CASTLE");
const VILLA_INTERIOR = createSimpleInterior(12, 8, "VILLA");
const AMPHI_INTERIOR = createSimpleInterior(14, 9, "AMPHI");

// =======================
//   MAP GENERATOR
// =======================
function createLuceraMap(width, height) {
  // base: prato ovunque
  const map = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => TILE_TYPE.GRASS)
  );

  // mura esterne (bordo mappa)
  for (let x = 0; x < width; x++) {
    map[0][x] = TILE_TYPE.WALL;
    map[height - 1][x] = TILE_TYPE.WALL;
  }
  for (let y = 0; y < height; y++) {
    map[y][0] = TILE_TYPE.WALL;
    map[y][width - 1] = TILE_TYPE.WALL;
  }

  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);

  // =========================
  // 1) PORTA TROIA (SUD) + CORSO PRINCIPALE
  // =========================

  // "porta" a sud: buco nelle mura + inizio corso
  map[height - 1][centerX] = TILE_TYPE.ROAD;
  map[height - 2][centerX] = TILE_TYPE.ROAD;

  // corso che sale verso il centro (fino quasi al Duomo)
  for (let y = height - 2; y >= centerY + 3; y--) {
    map[y][centerX] = TILE_TYPE.ROAD;
  }

  // leggera deviazione verso ovest, come il corso che si stringe
  for (let x = centerX - 1; x >= centerX - 3; x--) {
    map[centerY + 3][x] = TILE_TYPE.ROAD;
  }

  // =========================
  // 2) PIAZZA DUOMO (al centro, forma "a diamante")
  // =========================

  const duomoCenterX = centerX;
  const duomoCenterY = centerY;

  for (let y = duomoCenterY - 3; y <= duomoCenterY + 3; y++) {
    let halfWidth;
    if (y === duomoCenterY - 3 || y === duomoCenterY + 3) {
      halfWidth = 1;
    } else if (y === duomoCenterY - 2 || y === duomoCenterY + 2) {
      halfWidth = 2;
    } else if (y === duomoCenterY - 1 || y === duomoCenterY + 1) {
      halfWidth = 3;
    } else {
      halfWidth = 4;
    }

    for (let x = duomoCenterX - halfWidth; x <= duomoCenterX + halfWidth; x++) {
      map[y][x] = TILE_TYPE.DUOMO;
    }
  }

  const piazzaLeft = duomoCenterX - 4;
  const piazzaRight = duomoCenterX + 4;

  // stradine dal Duomo verso ovest ed est (centro storico)
  for (let x = piazzaLeft - 4; x < piazzaLeft; x++) {
    map[duomoCenterY][x] = TILE_TYPE.ROAD;
  }
  for (let x = piazzaRight + 1; x <= piazzaRight + 4; x++) {
    map[duomoCenterY - 1][x] = TILE_TYPE.ROAD; // verso anfiteatro
  }

  // =========================
  // 3) VILLA (NORD-OVEST del Duomo, fuori centro)
  // =========================

  const villaTop = duomoCenterY - 10;
  const villaBottom = villaTop + 5;
  const villaCenterX = duomoCenterX - 10;
  const villaLeft = villaCenterX - 4;
  const villaRight = villaCenterX + 3;

  for (let y = villaTop; y <= villaBottom; y++) {
    for (let x = villaLeft; x <= villaRight; x++) {
      map[y][x] = TILE_TYPE.VILLA;
    }
  }

  // stradina che collega Duomo → Villa
  for (let y = duomoCenterY - 1; y >= villaBottom + 1; y--) {
    map[y][duomoCenterX - 3] = TILE_TYPE.ROAD;
  }
  for (let x = duomoCenterX - 3; x >= villaCenterX; x--) {
    map[villaBottom + 1][x] = TILE_TYPE.ROAD;
  }

  // =========================
  // 4) CASTELLO (a Ovest della Villa, molto vicino)
  // =========================

  const castleCenterY = villaTop - 1;
  const castleCenterX = villaLeft - 5;
  const castleTop = castleCenterY - 3;
  const castleBottom = castleCenterY + 3;

  for (let y = castleTop; y <= castleBottom; y++) {
    let halfWidth;
    if (y === castleTop || y === castleBottom) {
      halfWidth = 3;
    } else if (y === castleTop + 1 || y === castleBottom - 1) {
      halfWidth = 4;
    } else {
      halfWidth = 5;
    }

    const left = castleCenterX - halfWidth;
    const right = castleCenterX + halfWidth;

    for (let x = left; x <= right; x++) {
      if (y > 0 && y < height - 1 && x > 0 && x < width - 1) {
        map[y][x] = TILE_TYPE.CASTLE;
      }
    }
  }

  // stradina Villa → Castello
  for (let x = villaLeft - 1; x >= castleCenterX + 1; x--) {
    map[villaTop + 1][x] = TILE_TYPE.ROAD;
  }

  // =========================
  // 5) ANFITEATRO (ad EST del centro storico)
  // =========================

  const amphiTop = duomoCenterY - 1;
  const amphiBottom = amphiTop + 5;
  const amphiLeft = duomoCenterX + 12;
  const amphiRight = amphiLeft + 6;

  for (let y = amphiTop; y <= amphiBottom; y++) {
    for (let x = amphiLeft; x <= amphiRight; x++) {
      if (y > 0 && y < height - 1 && x > 0 && x < width - 1) {
        map[y][x] = TILE_TYPE.AMPHI;
      }
    }
  }

  // strada Duomo → Anfiteatro
  for (let x = piazzaRight + 1; x <= amphiLeft - 1; x++) {
    map[duomoCenterY - 1][x] = TILE_TYPE.ROAD;
  }
  for (let y = duomoCenterY - 1; y <= amphiTop + 1; y++) {
    map[y][amphiLeft - 1] = TILE_TYPE.ROAD;
  }

  // =========================
  // PORTE SECONDARIE (fuori dalle mura)
  // =========================

  // --- Porta Foggia (Sud-Est) ---
  {
    const portaFoggiaX = duomoCenterX + 10;
    const portaFoggiaY = duomoCenterY + 10;

    if (
      portaFoggiaX > 1 &&
      portaFoggiaX < width - 1 &&
      portaFoggiaY > 1 &&
      portaFoggiaY < height - 1
    ) {
      map[portaFoggiaY][portaFoggiaX] = TILE_TYPE.ROAD;

      // strada dal centro verso Porta Foggia (a L)
      for (let x = piazzaRight + 2; x <= portaFoggiaX; x++) {
        map[duomoCenterY + 4][x] = TILE_TYPE.ROAD;
      }
      for (let y = duomoCenterY + 4; y <= portaFoggiaY; y++) {
        map[y][portaFoggiaX] = TILE_TYPE.ROAD;
      }

      // NPC a Porta Foggia
      map[portaFoggiaY][portaFoggiaX + 1] = {
        type: TILE_TYPE.NPC,
        id: "npc_porta_foggia",
      };
    }
  }

  // --- Porta Albana (Sud-Ovest) ---
  {
    const portaAlbanaX = duomoCenterX - 10;
    const portaAlbanaY = duomoCenterY + 10;

    if (
      portaAlbanaX > 1 &&
      portaAlbanaX < width - 1 &&
      portaAlbanaY > 1 &&
      portaAlbanaY < height - 1
    ) {
      map[portaAlbanaY][portaAlbanaX] = TILE_TYPE.ROAD;

      // strada dal centro verso Porta Albana (a L)
      for (let x = piazzaLeft - 2; x >= portaAlbanaX; x--) {
        map[duomoCenterY + 4][x] = TILE_TYPE.ROAD;
      }
      for (let y = duomoCenterY + 4; y <= portaAlbanaY; y++) {
        map[y][portaAlbanaX] = TILE_TYPE.ROAD;
      }

      // NPC a Porta Albana
      map[portaAlbanaY][portaAlbanaX - 1] = {
        type: TILE_TYPE.NPC,
        id: "npc_porta_albana",
      };
    }
  }

  // --- Porta San Severo (Nord-Est) ---
  {
    const portaSanSeveroX = duomoCenterX + 10;
    const portaSanSeveroY = duomoCenterY - 10;

    if (
      portaSanSeveroX > 1 &&
      portaSanSeveroX < width - 1 &&
      portaSanSeveroY > 1 &&
      portaSanSeveroY < height - 1
    ) {
      map[portaSanSeveroY][portaSanSeveroX] = TILE_TYPE.ROAD;

      // strada dal centro verso Porta San Severo
      for (let y = duomoCenterY - 3; y >= portaSanSeveroY; y--) {
        map[y][duomoCenterX + 4] = TILE_TYPE.ROAD;
      }
      for (let x = duomoCenterX + 4; x <= portaSanSeveroX; x++) {
        map[portaSanSeveroY][x] = TILE_TYPE.ROAD;
      }

      // NPC a Porta San Severo
      map[portaSanSeveroY - 1][portaSanSeveroX] = {
        type: TILE_TYPE.NPC,
        id: "npc_porta_san_severo",
      };
    }
  }

  // --- Porta San Giacomo (varco tra centro e anfiteatro) ---
  {
    const portaSanGiacomoY = duomoCenterY - 1;
    const portaSanGiacomoX = piazzaRight + 3;

    if (
      portaSanGiacomoX > 1 &&
      portaSanGiacomoX < width - 1 &&
      portaSanGiacomoY > 1 &&
      portaSanGiacomoY < height - 1
    ) {
      map[portaSanGiacomoY][portaSanGiacomoX] = TILE_TYPE.ROAD;

      map[portaSanGiacomoY + 1][portaSanGiacomoX] = {
        type: TILE_TYPE.NPC,
        id: "npc_porta_san_giacomo",
      };
    }
  }

  // =========================
  // 6) QUARTIERI DI CASE ATTORNO AL CENTRO
  // =========================

  function isInSpecialArea(x, y) {
    const inVilla =
      y >= villaTop && y <= villaBottom && x >= villaLeft && x <= villaRight;
    const inCastle =
      y >= castleTop &&
      y <= castleBottom &&
      x >= castleCenterX - 7 &&
      x <= castleCenterX + 7;
    const inAmphi =
      y >= amphiTop && y <= amphiBottom && x >= amphiLeft && x <= amphiRight;
    const inDuomo =
      y >= duomoCenterY - 3 &&
      y <= duomoCenterY + 3 &&
      x >= duomoCenterX - 4 &&
      x <= duomoCenterX + 4;

    return inVilla || inCastle || inAmphi || inDuomo;
  }

  // case a ovest del corso
  for (let y = 5; y < height - 4; y++) {
    for (let x = 2; x < centerX - 5; x++) {
      if (map[y][x] === TILE_TYPE.GRASS && !isInSpecialArea(x, y)) {
        map[y][x] = TILE_TYPE.HOUSE;
      }
    }
  }

  // case a est del corso
  for (let y = 5; y < height - 4; y++) {
    for (let x = centerX + 5; x < width - 3; x++) {
      if (map[y][x] === TILE_TYPE.GRASS && !isInSpecialArea(x, y)) {
        map[y][x] = TILE_TYPE.HOUSE;
      }
    }
  }

  // =========================
  // 7) NPC (niente più nemici fissi)
  // =========================

  // NPC: guida in piazza Duomo
  map[duomoCenterY][duomoCenterX] = {
    type: TILE_TYPE.NPC,
    id: "npc_duomo",
  };

  // NPC: villa (belvedere) a Nord-Ovest
  const villaNpcY = villaTop + 2;
  const villaNpcX = villaCenterX;
  map[villaNpcY][villaNpcX] = {
    type: TILE_TYPE.NPC,
    id: "npc_villa",
  };

  // NPC: Porta Troia (a sud lungo il corso)
  map[height - 3][centerX + 2] = {
    type: TILE_TYPE.NPC,
    id: "npc_porta_troia",
  };

  return map;
}

// =======================
//   DIALOGHI NPC (con quest)
// =======================
function getNpcDialogAndQuestUpdate(npcId, questStep) {
  let newQuestStep = questStep;
  let text = "";

  switch (npcId) {
    case "npc_porta_troia":
      if (questStep === 0) {
        newQuestStep = 1;
        text =
          "Benvenuto a Lucera, stai entrando da Porta Troia. Se vuoi conoscere davvero la città, passa prima in piazza Duomo e poi fai un salto alla villa.";
      } else if (questStep === 1) {
        text =
          "Allora, sei già passato in piazza Duomo? La guida lì ti racconterà qualcosa in più.";
      } else if (questStep === 2) {
        text =
          "Hai visto la piazza, ora non ti resta che la villa: sali verso Nord-Ovest, il belvedere ti aspetta.";
      } else {
        text =
          "Hai fatto il tuo giro: Porta Troia, Duomo e villa. Niente male come primo tour, eh?";
      }
      break;

    case "npc_duomo":
      if (questStep === 0) {
        text =
          "Questa è la piazza del Duomo. Molti iniziano il giro da Porta Troia, ma non preoccuparti: Lucera ti aspetta comunque.";
      } else if (questStep === 1) {
        newQuestStep = 2;
        text =
          "Benvenuto in piazza Duomo! Ora che sei passato da Porta Troia, il tuo prossimo passo è la villa: sali verso Nord-Ovest, verso il belvedere.";
      } else if (questStep === 2) {
        text =
          "Hai iniziato bene: Porta Troia e piazza Duomo. Manca solo la villa per completare il tuo primo giro.";
      } else {
        text =
          "Ormai conosci bene la piazza, ma ogni volta che ci passi c'è sempre qualcosa di nuovo da notare.";
      }
      break;

    case "npc_villa":
      if (questStep === 0) {
        text =
          "Questa è la villa, il belvedere di Lucera. Se non ci sei già stato, un giorno prova a partire da Porta Troia e salire fino al Duomo.";
      } else if (questStep === 1) {
        text =
          "Hai iniziato da Porta Troia? Bravo. Prima di tutto passa dalla piazza del Duomo, poi torna qui a goderti il panorama.";
      } else if (questStep === 2) {
        newQuestStep = 3;
        text =
          "Eccoti qui, alla villa! Hai fatto tutto il giro: Porta Troia, Duomo e infine il belvedere. Primo tour di Lucera completato! 🎉";
      } else {
        text =
          "La villa è sempre qui ad aspettarti. Anche quando conosci la città a memoria, il panorama non stanca mai.";
      }
      break;

    case "npc_porta_foggia":
      text =
        "Questa è Porta Foggia, una delle uscite verso la pianura e i collegamenti verso est. Un tempo da qui passavano mercanti e viaggiatori.";
      break;

    case "npc_porta_albana":
      text =
        "Porta Albana custodisce l’accesso sud-ovest alla città. È meno trafficata, ma ha visto passare secoli di storia.";
      break;

    case "npc_porta_san_severo":
      text =
        "Da Porta San Severo si esce verso nord-est. Se ti allontani abbastanza, vedi Lucera dall’alto, appoggiata sul colle.";
      break;

    case "npc_porta_san_giacomo":
      text =
        "Questa è Porta San Giacomo: da qui passi dal centro storico verso l’anfiteatro e la zona est della città.";
      break;

    default:
      text = "Ciao! Sono un cittadino di Lucera.";
  }

  return { text, newQuestStep };
}

// =======================
//    QUEST OBJECTIVE TEXT
// =======================
function getQuestObjective(questStep) {
  switch (questStep) {
    case 0:
      return "Quest 1: parla con qualcuno a Porta Troia, in basso lungo il corso.";
    case 1:
      return "Quest 1: raggiungi piazza Duomo e parla con la guida.";
    case 2:
      return "Quest 1: vai alla villa/belvedere e parla con l'NPC nel parco.";
    case 3:
      return "Quest 1 completata: hai fatto il tuo primo giro di Lucera! 🎉";
    default:
      return "";
  }
}

// =======================
//    ENCOUNTER LOGIC
// =======================

// tile che permettono incontri random (fuori dalle strade)
function isRandomEncounterTile(tileType) {
  return tileType === TILE_TYPE.GRASS || tileType === TILE_TYPE.HOUSE;
}

// quanto è frequente l’incontro (0.0–1.0)
const ENCOUNTER_CHANCE = 0.18; // ~18% per passo in zona "selvaggia"

// =======================
//    QUIZ PORTE / OGGETTI
// =======================

function getDoorQuiz(doorKey) {
  switch (doorKey) {
    case "porta_troia":
      return {
        question: "Porta Troia a Lucera si trova storicamente sul lato...",
        options: ["Sud della città", "Nord della città"],
        correctIndex: 0,
        reward: { type: "potion", label: "Pozione (+10 HP)" },
      };
    case "porta_foggia":
      return {
        question:
          "Porta Foggia collegava Lucera soprattutto con i territori in direzione...",
        options: ["Est e la pianura", "Ovest e la montagna"],
        correctIndex: 0,
        reward: { type: "megapotion", label: "Megapozione (HP completi)" },
      };
    case "porta_albana":
      return {
        question:
          "Porta Albana è storicamente associata all’accesso sul lato...",
        options: ["Sud-Ovest", "Nord-Est"],
        correctIndex: 0,
        reward: { type: "sword", label: "Spada (+10 ATT)" },
      };
    case "porta_san_severo":
      return {
        question:
          "Da Porta San Severo si usciva in direzione prevalentemente...",
        options: ["Nord-Est", "Sud-Est"],
        correctIndex: 0,
        reward: { type: "shield", label: "Scudo (dimezza i danni, max 3)" },
      };
    case "porta_san_giacomo":
      return {
        question:
          "Porta San Giacomo mette in comunicazione soprattutto il centro storico con...",
        options: ["L’anfiteatro e la zona est", "La villa comunale"],
        correctIndex: 0,
        reward: { type: "potion", label: "Pozione (+10 HP)" },
      };
    default:
      return null;
  }
}

// =======================
//  ATTACCO ED EFFETTI EQUIP
// =======================
function getEffectiveAttack(playerStats, equipment) {
  let bonus = 0;
  if (equipment.weapon === "sword") bonus += 10;
  return playerStats.attack + bonus;
}

function getDamageToPlayer(baseDamage, equipment) {
  if (equipment.shield === "shield") {
    const halved = Math.ceil(baseDamage / 2);
    return Math.min(3, halved);
  }
  return baseDamage;
}

// =======================
//       APP
// =======================
export default function App() {
  const [map] = useState(() => createLuceraMap(MAP_WIDTH, MAP_HEIGHT));

  const [player, setPlayer] = useState(() => ({
    x: Math.floor(MAP_WIDTH / 2),
    y: MAP_HEIGHT - 3,
  }));

  const [mode, setMode] = useState("world"); // "world" | "dialog" | "battle" | "quiz"
  const [scene, setScene] = useState("world"); // "world" | "duomo" | "castle" | "villa" | "amphi"
  const [currentDialog, setCurrentDialog] = useState(null);

  const [playerStats, setPlayerStats] = useState({
    hp: 30,
    maxHp: 30,
    attack: 5,
  });

  const [enemyStats, setEnemyStats] = useState(null);

  const [battleStats, setBattleStats] = useState({
    damageDealt: 0,
    damageTaken: 0,
  });

  // INVENTARIO
  const [inventory, setInventory] = useState({
    potion: 0,
    megapotion: 0,
    sword: 0,
    shield: 0,
  });

  // EQUIP
  const [equipment, setEquipment] = useState({
    weapon: null, // "sword"
    shield: null, // "shield"
  });

  // Pannelli UI
  const [showInventory, setShowInventory] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);

  // QUEST 1
  const [questStep, setQuestStep] = useState(0);

  // QUEST 2: porte visitate
  const [doorsVisited, setDoorsVisited] = useState({
    porta_troia: false,
    porta_foggia: false,
    porta_albana: false,
    porta_san_severo: false,
    porta_san_giacomo: false,
  });

  // ricompense delle porte già ottenute
  const [doorRewards, setDoorRewards] = useState({
    porta_troia: false,
    porta_foggia: false,
    porta_albana: false,
    porta_san_severo: false,
    porta_san_giacomo: false,
  });

  // quiz attuale
  const [quiz, setQuiz] = useState(null);

  // =======================
  // MOVIMENTO + ENTER + I/E
  // =======================
  useEffect(() => {
    function handleKeyDown(e) {
      // toggle inventario (I) ed equip (E) solo in modalità world
      if (mode === "world") {
        if (e.key === "i" || e.key === "I") {
          e.preventDefault();
          setShowInventory((prev) => !prev);
          return;
        }
        if (e.key === "e" || e.key === "E") {
          e.preventDefault();
          setShowEquipment((prev) => !prev);
          return;
        }
      }

      // se siamo in quiz / dialog / battle, niente movimento
      if (mode === "quiz" || mode === "dialog" || mode === "battle") {
        if (mode === "quiz" && e.key === "Escape") {
          e.preventDefault();
          setMode("world");
          setQuiz(null);
        }
        return;
      }

      // ESC o Invio negli interni: esci e torni alla mappa
      if (scene !== "world" && (e.key === "Enter" || e.key === "Escape")) {
        e.preventDefault();
        if (mode === "world") {
          setScene("world");
        }
        return;
      }

      // Invio sulla mappa per entrare negli interni
      if (scene === "world" && e.key === "Enter") {
        e.preventDefault();
        if (mode !== "world") return;

        const tileRaw = map[player.y][player.x];
        const tileType = tileRaw?.type || tileRaw;

        if (tileType === TILE_TYPE.DUOMO) {
          setScene("duomo");
        } else if (tileType === TILE_TYPE.CASTLE) {
          setScene("castle");
        } else if (tileType === TILE_TYPE.VILLA) {
          setScene("villa");
        } else if (tileType === TILE_TYPE.AMPHI) {
          setScene("amphi");
        }
        return;
      }

      // se siamo in un interno, niente movimento
      if (scene !== "world") return;

      let dx = 0;
      let dy = 0;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          dy = -1;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          dy = 1;
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          dx = -1;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          dx = 1;
          break;
        default:
          return;
      }

      e.preventDefault();

      const newX = player.x + dx;
      const newY = player.y + dy;

      if (
        newY < 0 ||
        newY >= map.length ||
        newX < 0 ||
        newX >= map[0].length
      ) {
        return;
      }

      const tile = map[newY][newX];

      // muri non attraversabili
      if (tile === TILE_TYPE.WALL) return;

      // NPC → quiz porte oppure dialogo
      if (tile?.type === TILE_TYPE.NPC) {
        const npcId = tile.id;

        if (npcId.startsWith("npc_porta_")) {
          const doorKey = npcId.replace("npc_", "");
          setDoorsVisited((prev) => ({
            ...prev,
            [doorKey]: true,
          }));

          if (!doorRewards[doorKey]) {
            const doorQuiz = getDoorQuiz(doorKey);
            if (doorQuiz) {
              setPlayer({ x: newX, y: newY });
              setMode("quiz");
              setQuiz({ doorKey, ...doorQuiz });
              return;
            }
          }
        }

        const { text, newQuestStep } = getNpcDialogAndQuestUpdate(
          npcId,
          questStep
        );

        setPlayer({ x: newX, y: newY });
        setMode("dialog");
        setCurrentDialog({ text });
        setQuestStep(newQuestStep);
        return;
      }

      // RANDOM ENCOUNTER
      const tileType = tile?.type || tile;
      if (isRandomEncounterTile(tileType)) {
        if (Math.random() < ENCOUNTER_CHANCE) {
          setPlayer({ x: newX, y: newY });
          startBattle();
          return;
        }
      }

      setPlayer({ x: newX, y: newY });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player, map, mode, questStep, scene, doorRewards]);

  // =======================
  // BATTAGLIA
  // =======================
  function startBattle() {
    setMode("battle");
    setBattleStats({ damageDealt: 0, damageTaken: 0 });
    const enemy = {
      name: "Spirito della pianura",
      hp: 15,
      maxHp: 15,
      attack: 3,
    };
    setEnemyStats(enemy);
  }

  function handlePlayerAttack() {
    if (!enemyStats) return;

    const effectiveAttack = getEffectiveAttack(playerStats, equipment);

    const damageThisHit = Math.min(enemyStats.hp, effectiveAttack);
    const newEnemyHp = enemyStats.hp - damageThisHit;
    const enemyStillAlive = newEnemyHp > 0;

    const updatedEnemy = {
      ...enemyStats,
      hp: Math.max(newEnemyHp, 0),
    };
    setEnemyStats(updatedEnemy);

    const totalDamageDealt = battleStats.damageDealt + damageThisHit;
    setBattleStats((prev) => ({
      ...prev,
      damageDealt: totalDamageDealt,
    }));

    if (!enemyStillAlive) {
      setMode("world");
      setEnemyStats(null);
      alert(
        `Hai vinto la battaglia contro ${enemyStats.name}!\n` +
          `Hai inflitto ${totalDamageDealt} danni e hai subito ${battleStats.damageTaken} danni.`
      );
      return;
    }

    const baseDamage = enemyStats.attack;
    const damageToPlayer = Math.min(
      playerStats.hp,
      getDamageToPlayer(baseDamage, equipment)
    );
    const newPlayerHp = playerStats.hp - damageToPlayer;
    const updatedPlayer = {
      ...playerStats,
      hp: Math.max(newPlayerHp, 0),
    };
    setPlayerStats(updatedPlayer);

    setBattleStats((prev) => ({
      ...prev,
      damageTaken: prev.damageTaken + damageToPlayer,
    }));

    if (newPlayerHp <= 0) {
      alert(
        "Sei stato sconfitto! (per ora ricarica la pagina per ricominciare 😅)"
      );
    }
  }

  function handleBattleRun() {
    setMode("world");
    setEnemyStats(null);
  }

  // =======================
  // USO OGGETTI / EQUIP
  // =======================
  function usePotion() {
    if (inventory.potion <= 0) {
      alert("Non hai pozioni da usare.");
      return;
    }
    if (playerStats.hp >= playerStats.maxHp) {
      alert("Hai già tutti gli HP, non serve usare una pozione.");
      return;
    }
    const heal = 10;
    const newHp = Math.min(playerStats.maxHp, playerStats.hp + heal);
    setPlayerStats((prev) => ({ ...prev, hp: newHp }));
    setInventory((prev) => ({ ...prev, potion: prev.potion - 1 }));
  }

  function useMegapotion() {
    if (inventory.megapotion <= 0) {
      alert("Non hai megapozioni da usare.");
      return;
    }
    if (playerStats.hp >= playerStats.maxHp) {
      alert("Hai già tutti gli HP, non serve usare una megapozione.");
      return;
    }
    setPlayerStats((prev) => ({ ...prev, hp: prev.maxHp }));
    setInventory((prev) => ({ ...prev, megapotion: prev.megapotion - 1 }));
  }

  function toggleSword() {
    if (inventory.sword <= 0) {
      alert("Non hai una spada nell'inventario.");
      return;
    }
    setEquipment((prev) => ({
      ...prev,
      weapon: prev.weapon === "sword" ? null : "sword",
    }));
  }

  function toggleShield() {
    if (inventory.shield <= 0) {
      alert("Non hai uno scudo nell'inventario.");
      return;
    }
    setEquipment((prev) => ({
      ...prev,
      shield: prev.shield === "shield" ? null : "shield",
    }));
  }

  // =======================
  // QUIZ PORTE
  // =======================
  function handleQuizAnswer(index) {
    if (!quiz) return;
    const { doorKey, correctIndex, reward } = quiz;

    if (index === correctIndex) {
      alert(`Risposta corretta! Hai ottenuto: ${reward.label}.`);

      setDoorRewards((prev) => ({
        ...prev,
        [doorKey]: true,
      }));

      setInventory((prev) => {
        const next = { ...prev };
        if (reward.type === "potion") next.potion += 1;
        if (reward.type === "megapotion") next.megapotion += 1;
        if (reward.type === "sword") next.sword = Math.max(next.sword + 1, 1);
        if (reward.type === "shield") next.shield = Math.max(next.shield + 1, 1);
        return next;
      });
    } else {
      alert("Risposta sbagliata! Riprova a parlare con questa porta più tardi.");
    }

    setQuiz(null);
    setMode("world");
  }

  function handleCloseDialog() {
    setCurrentDialog(null);
    setMode("world");
  }

  // =======================
  // RENDER
  // =======================
  const questText = getQuestObjective(questStep);
  const doorsCount = Object.values(doorsVisited).filter(Boolean).length;
  const doorsQuestText =
    doorsCount === 5
      ? "Quest 2: hai visitato tutte le porte di Lucera! 🎉"
      : `Quest 2: porte visitate ${doorsCount}/5`;

  const effectiveAttack = getEffectiveAttack(playerStats, equipment);

  let enterHint = "";
  if (scene === "world") {
    const tileRaw = map[player.y][player.x];
    const tileType = tileRaw?.type || tileRaw;

    if (
      tileType === TILE_TYPE.DUOMO ||
      tileType === TILE_TYPE.CASTLE ||
      tileType === TILE_TYPE.VILLA ||
      tileType === TILE_TYPE.AMPHI
    ) {
      enterHint = 'Premi "Invio" per accedere alla mini-mappa';
    }
  }

  let mainView = null;
  if (scene === "world") {
    mainView = <WorldMap map={map} player={player} />;
  } else {
    mainView = <InteriorMap scene={scene} />;
  }

  return (
    <div className="game-root">
      <h1 className="title">Mini RPG Lucera</h1>

      <div className="hud">
        <span>
          HP: {playerStats.hp} / {playerStats.maxHp}
        </span>
        <span>ATT: {effectiveAttack}</span>
        <span>Modalità: {mode}</span>
        <span>Scena: {scene}</span>
        <span>
          Posizione: ({player.x}, {player.y})
        </span>
      </div>

      <div className="quest">
        <div>{questText}</div>
        <div>{doorsQuestText}</div>
      </div>

      {enterHint && <div className="enter-hint">{enterHint}</div>}

      {showInventory && (
        <InventoryPanel
          inventory={inventory}
          onUsePotion={usePotion}
          onUseMegapotion={useMegapotion}
          onClose={() => setShowInventory(false)}
        />
      )}

      {showEquipment && (
        <EquipmentPanel
          inventory={inventory}
          equipment={equipment}
          onToggleSword={toggleSword}
          onToggleShield={toggleShield}
          onClose={() => setShowEquipment(false)}
        />
      )}

      {mode === "world" && mainView}

      {mode === "dialog" && currentDialog && (
        <DialogBox text={currentDialog.text} onClose={handleCloseDialog} />
      )}

      {mode === "quiz" && quiz && (
        <QuizDialog quiz={quiz} onAnswer={handleQuizAnswer} />
      )}

      {mode === "battle" && enemyStats && (
        <BattleScreen
          playerStats={playerStats}
          effectiveAttack={effectiveAttack}
          equipment={equipment}
          enemy={enemyStats}
          onAttack={handlePlayerAttack}
          onRun={handleBattleRun}
        />
      )}

      <ControlsHint />
    </div>
  );
}

// =======================
//   WORLD MAP COMPONENT (con camera)
// =======================

function WorldMap({ map, player }) {
  const rows = map.length;
  const cols = map[0].length;

  const VIEW_WIDTH = 20;
  const VIEW_HEIGHT = 15;

  const halfVW = Math.floor(VIEW_WIDTH / 2);
  const halfVH = Math.floor(VIEW_HEIGHT / 2);

  let startX = player.x - halfVW;
  let startY = player.y - halfVH;

  if (startX < 0) startX = 0;
  if (startY < 0) startY = 0;
  if (startX + VIEW_WIDTH > cols) startX = cols - VIEW_WIDTH;
  if (startY + VIEW_HEIGHT > rows) startY = rows - VIEW_HEIGHT;

  const endX = startX + VIEW_WIDTH - 1;
  const endY = startY + VIEW_HEIGHT - 1;

  const tiles = [];
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const tile = map[y][x];
      const isPlayer = player.x === x && player.y === y;

      const tileType = tile?.type || tile;
      let className = "tile";

      switch (tileType) {
        case TILE_TYPE.WALL:
          className += " tile-wall";
          break;
        case TILE_TYPE.GRASS:
          className += " tile-grass";
          break;
        case TILE_TYPE.ROAD:
          className += " tile-road";
          break;
        case TILE_TYPE.CASTLE:
          className += " tile-castle";
          break;
        case TILE_TYPE.DUOMO:
          className += " tile-duomo";
          break;
        case TILE_TYPE.VILLA:
          className += " tile-villa";
          break;
        case TILE_TYPE.HOUSE:
          className += " tile-house";
          break;
        case TILE_TYPE.NPC:
          className += " tile-npc";
          break;
        case TILE_TYPE.ENEMY:
          className += " tile-enemy";
          break;
        case TILE_TYPE.AMPHI:
          className += " tile-amphi";
          break;
        default:
          className += " tile-grass";
      }

      if (isPlayer) {
        className += " tile-player";
      }

      let label = "";
      if (tileType === TILE_TYPE.CASTLE) label = "C";
      if (tileType === TILE_TYPE.DUOMO) label = "D";
      if (tileType === TILE_TYPE.VILLA) label = "V";
      if (tileType === TILE_TYPE.HOUSE) label = "H";
      if (tileType === TILE_TYPE.AMPHI) label = "A";

      if (tileType === TILE_TYPE.NPC && tile?.id) {
        if (tile.id === "npc_porta_troia") label = "T";
        else if (tile.id === "npc_porta_foggia") label = "F";
        else if (tile.id === "npc_porta_albana") label = "A";
        else if (tile.id === "npc_porta_san_severo") label = "SS";
        else if (tile.id === "npc_porta_san_giacomo") label = "SG";
      }

      tiles.push(
        <div key={`${x}-${y}`} className={className}>
          {label && <span className="tile-label">{label}</span>}
        </div>
      );
    }
  }

  return (
    <div
      className="world-map"
      style={{
        gridTemplateColumns: `repeat(${VIEW_WIDTH}, 20px)`,
        gridTemplateRows: `repeat(${VIEW_HEIGHT}, 20px)`,
      }}
    >
      {tiles}
    </div>
  );
}

// =======================
//   INTERIOR MAP
// =======================

function getInteriorMapForScene(scene) {
  switch (scene) {
    case "duomo":
      return DUOMO_INTERIOR;
    case "castle":
      return CASTLE_INTERIOR;
    case "villa":
      return VILLA_INTERIOR;
    case "amphi":
      return AMPHI_INTERIOR;
    default:
      return DUOMO_INTERIOR;
  }
}

function InteriorMap({ scene }) {
  const map = getInteriorMapForScene(scene);
  const rows = map.length;
  const cols = map[0].length;

  const tiles = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const tile = map[y][x];
      const tileType = tile?.type || tile;
      let className = "tile";

      switch (tileType) {
        case TILE_TYPE.WALL:
          className += " tile-wall";
          break;
        case TILE_TYPE.DUOMO:
          className += " tile-duomo";
          break;
        case TILE_TYPE.CASTLE:
          className += " tile-castle";
          break;
        case TILE_TYPE.VILLA:
          className += " tile-villa";
          break;
        case TILE_TYPE.AMPHI:
          className += " tile-amphi";
          break;
        default:
          className += " tile-road";
      }

      let label = "";
      if (tileType === TILE_TYPE.DUOMO) label = "D";
      if (tileType === TILE_TYPE.CASTLE) label = "C";
      if (tileType === TILE_TYPE.VILLA) label = "V";
      if (tileType === TILE_TYPE.AMPHI) label = "A";

      tiles.push(
        <div key={`${x}-${y}`} className={className}>
          {label && <span className="tile-label">{label}</span>}
        </div>
      );
    }
  }

  return (
    <div
      className="world-map"
      style={{
        gridTemplateColumns: `repeat(${cols}, 20px)`,
        gridTemplateRows: `repeat(${rows}, 20px)`,
      }}
    >
      {tiles}
    </div>
  );
}

// =======================
//   DIALOG, QUIZ & BATTLE UI
// =======================
function DialogBox({ text, onClose }) {
  return (
    <div className="overlay">
      <div className="dialog-box">
        <p>{text}</p>
        <button onClick={onClose}>Chiudi</button>
      </div>
    </div>
  );
}

function QuizDialog({ quiz, onAnswer }) {
  const { question, options } = quiz;
  return (
    <div className="overlay">
      <div className="dialog-box">
        <p>{question}</p>
        <div className="quiz-options">
          {options.map((opt, idx) => (
            <button key={idx} onClick={() => onAnswer(idx)}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BattleScreen({
  playerStats,
  effectiveAttack,
  equipment,
  enemy,
  onAttack,
  onRun,
}) {
  return (
    <div className="overlay">
      <div className="battle-box">
        <h2>⚔️ Battaglia</h2>
        <div className="battle-status">
          <div>
            <h3>Tu</h3>
            <p>
              HP: {playerStats.hp} / {playerStats.maxHp}
            </p>
            <p>
              ATT: {effectiveAttack}
              {equipment.weapon === "sword" ? " (Spada equipaggiata)" : ""}
            </p>
            {equipment.shield === "shield" && <p>Scudo equipaggiato 🛡️</p>}
          </div>
          <div>
            <h3>{enemy.name}</h3>
            <p>
              HP: {enemy.hp} / {enemy.maxHp}
            </p>
            <p>ATT: {enemy.attack}</p>
          </div>
        </div>

        <div className="battle-actions">
          <button onClick={onAttack}>Attacca</button>
          <button onClick={onRun}>Fuggi</button>
        </div>
      </div>
    </div>
  );
}

// =======================
//   INVENTORY & EQUIP PANELS
// =======================
function InventoryPanel({ inventory, onUsePotion, onUseMegapotion, onClose }) {
  return (
    <div className="side-panel inventory-panel">
      <div className="side-panel-header">
        <h2>Inventario</h2>
        <button onClick={onClose}>X</button>
      </div>
      <div className="side-panel-body">
        <p>Pozioni: {inventory.potion}</p>
        <button onClick={onUsePotion}>Usa Pozione (+10 HP)</button>

        <p>Megapozioni: {inventory.megapotion}</p>
        <button onClick={onUseMegapotion}>Usa Megapozione (HP completi)</button>
      </div>
    </div>
  );
}

function EquipmentPanel({
  inventory,
  equipment,
  onToggleSword,
  onToggleShield,
  onClose,
}) {
  return (
    <div className="side-panel equipment-panel">
      <div className="side-panel-header">
        <h2>Equipaggiamento</h2>
        <button onClick={onClose}>X</button>
      </div>
      <div className="side-panel-body">
        <p>
          Spade: {inventory.sword}{" "}
          {equipment.weapon === "sword" ? "(equipaggiata)" : ""}
        </p>
        <button onClick={onToggleSword}>
          {equipment.weapon === "sword"
            ? "Togli Spada"
            : "Equipaggia Spada (+10 ATT)"}
        </button>

        <p>
          Scudi: {inventory.shield}{" "}
          {equipment.shield === "shield" ? "(equipaggiato)" : ""}
        </p>
        <button onClick={onToggleShield}>
          {equipment.shield === "shield"
            ? "Togli Scudo"
            : "Equipaggia Scudo (dimezza danni, max 3)"}
        </button>
      </div>
    </div>
  );
}

function ControlsHint() {
  return (
    <div className="controls">
      <p>
        Usa <b>WASD</b> o <b>frecce</b> per muoverti. Premi <b>Invio</b> quando
        sei su Duomo, Castello, Villa o Anfiteatro per entrare negli interni, e
        premi di nuovo <b>Invio</b> o <b>Esc</b> per uscire. Parla con l'NPC a
        Porta Troia, poi in piazza Duomo e infine alla villa per completare la
        Quest 1; visita tutte le porte per completare la Quest 2. Fuori dalle
        strade puoi incontrare nemici casuali! Premi <b>I</b> per aprire/chiudere
        l'inventario e <b>E</b> per aprire/chiudere l'equipaggiamento.
      </p>
    </div>
  );
}
