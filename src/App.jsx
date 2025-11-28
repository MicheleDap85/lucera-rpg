import { useEffect, useState } from "react";

// =======================
//   TILE TYPES
// =======================
const TILE_TYPE = {
  WALL: "WALL",
  GRASS: "GRASS",
  ROAD: "ROAD",
  CASTLE: "CASTLE",
  DUOMO: "DUOMO",
  VILLA: "VILLA",
  HOUSE: "HOUSE",
  AMPHI: "AMPHI",
  NPC: "NPC",
  ENEMY: "ENEMY",
};

const MAP_WIDTH = 60;
const MAP_HEIGHT = 40;

// =======================
//   SIMPLE INTERIORS
// =======================
function createSimpleInterior(width, height, labelType) {
  const map = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => TILE_TYPE.ROAD)
  );

  // mura
  for (let x = 0; x < width; x++) {
    map[0][x] = TILE_TYPE.WALL;
    map[height - 1][x] = TILE_TYPE.WALL;
  }
  for (let y = 0; y < height; y++) {
    map[y][0] = TILE_TYPE.WALL;
    map[y][width - 1] = TILE_TYPE.WALL;
  }

  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);

  if (labelType === "DUOMO") map[cy][cx] = TILE_TYPE.DUOMO;
  if (labelType === "CASTLE") map[cy][cx] = TILE_TYPE.CASTLE;
  if (labelType === "VILLA") map[cy][cx] = TILE_TYPE.VILLA;
  if (labelType === "AMPHI") map[cy][cx] = TILE_TYPE.AMPHI;

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
  const map = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => TILE_TYPE.GRASS)
  );

  // mura bordo
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

  // Porta Troia + corso
  map[height - 1][centerX] = TILE_TYPE.ROAD;
  map[height - 2][centerX] = TILE_TYPE.ROAD;
  for (let y = height - 2; y >= centerY + 3; y--) {
    map[y][centerX] = TILE_TYPE.ROAD;
  }
  for (let x = centerX - 1; x >= centerX - 3; x--) {
    map[centerY + 3][x] = TILE_TYPE.ROAD;
  }

  // Piazza Duomo a diamante
  const duomoCenterX = centerX;
  const duomoCenterY = centerY;

  for (let y = duomoCenterY - 3; y <= duomoCenterY + 3; y++) {
    let halfWidth;
    if (y === duomoCenterY - 3 || y === duomoCenterY + 3) halfWidth = 1;
    else if (y === duomoCenterY - 2 || y === duomoCenterY + 2) halfWidth = 2;
    else if (y === duomoCenterY - 1 || y === duomoCenterY + 1) halfWidth = 3;
    else halfWidth = 4;

    for (let x = duomoCenterX - halfWidth; x <= duomoCenterX + halfWidth; x++) {
      map[y][x] = TILE_TYPE.DUOMO;
    }
  }

  const piazzaLeft = duomoCenterX - 4;
  const piazzaRight = duomoCenterX + 4;

  for (let x = piazzaLeft - 4; x < piazzaLeft; x++) {
    map[duomoCenterY][x] = TILE_TYPE.ROAD;
  }
  for (let x = piazzaRight + 1; x <= piazzaRight + 4; x++) {
    map[duomoCenterY - 1][x] = TILE_TYPE.ROAD;
  }

  // Villa NW, fuori mura
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

  for (let y = duomoCenterY - 1; y >= villaBottom + 1; y--) {
    map[y][duomoCenterX - 3] = TILE_TYPE.ROAD;
  }
  for (let x = duomoCenterX - 3; x >= villaCenterX; x--) {
    map[villaBottom + 1][x] = TILE_TYPE.ROAD;
  }

  // Castello Ovest della villa
  const castleCenterY = villaTop - 1;
  const castleCenterX = villaLeft - 5;
  const castleTop = castleCenterY - 3;
  const castleBottom = castleCenterY + 3;

  for (let y = castleTop; y <= castleBottom; y++) {
    let halfWidth;
    if (y === castleTop || y === castleBottom) halfWidth = 3;
    else if (y === castleTop + 1 || y === castleBottom - 1) halfWidth = 4;
    else halfWidth = 5;

    const left = castleCenterX - halfWidth;
    const right = castleCenterX + halfWidth;

    for (let x = left; x <= right; x++) {
      if (y > 0 && y < height - 1 && x > 0 && x < width - 1) {
        map[y][x] = TILE_TYPE.CASTLE;
      }
    }
  }

  for (let x = villaLeft - 1; x >= castleCenterX + 1; x--) {
    map[villaTop + 1][x] = TILE_TYPE.ROAD;
  }

  // Anfiteatro a Est
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

  for (let x = piazzaRight + 1; x <= amphiLeft - 1; x++) {
    map[duomoCenterY - 1][x] = TILE_TYPE.ROAD;
  }
  for (let y = duomoCenterY - 1; y <= amphiTop + 1; y++) {
    map[y][amphiLeft - 1] = TILE_TYPE.ROAD;
  }

  // Porte
  // Porta Foggia SE
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
      for (let x = piazzaRight + 2; x <= portaFoggiaX; x++) {
        map[duomoCenterY + 4][x] = TILE_TYPE.ROAD;
      }
      for (let y = duomoCenterY + 4; y <= portaFoggiaY; y++) {
        map[y][portaFoggiaX] = TILE_TYPE.ROAD;
      }

      map[portaFoggiaY][portaFoggiaX + 1] = {
        type: TILE_TYPE.NPC,
        id: "npc_porta_foggia",
      };
    }
  }

  // Porta Albana SO
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
      for (let x = piazzaLeft - 2; x >= portaAlbanaX; x--) {
        map[duomoCenterY + 4][x] = TILE_TYPE.ROAD;
      }
      for (let y = duomoCenterY + 4; y <= portaAlbanaY; y++) {
        map[y][portaAlbanaX] = TILE_TYPE.ROAD;
      }

      map[portaAlbanaY][portaAlbanaX - 1] = {
        type: TILE_TYPE.NPC,
        id: "npc_porta_albana",
      };
    }
  }

  // Porta San Severo NE
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

      for (let y = duomoCenterY - 3; y >= portaSanSeveroY; y--) {
        map[y][duomoCenterX + 4] = TILE_TYPE.ROAD;
      }
      for (let x = duomoCenterX + 4; x <= portaSanSeveroX; x++) {
        map[portaSanSeveroY][x] = TILE_TYPE.ROAD;
      }

      map[portaSanSeveroY - 1][portaSanSeveroX] = {
        type: TILE_TYPE.NPC,
        id: "npc_porta_san_severo",
      };
    }
  }

  // Porta San Giacomo tra centro e anfiteatro
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

  // case attorno al centro
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

  for (let y = 5; y < height - 4; y++) {
    for (let x = 2; x < centerX - 5; x++) {
      if (map[y][x] === TILE_TYPE.GRASS && !isInSpecialArea(x, y)) {
        map[y][x] = TILE_TYPE.HOUSE;
      }
    }
  }

  for (let y = 5; y < height - 4; y++) {
    for (let x = centerX + 5; x < width - 3; x++) {
      if (map[y][x] === TILE_TYPE.GRASS && !isInSpecialArea(x, y)) {
        map[y][x] = TILE_TYPE.HOUSE;
      }
    }
  }

  // NPC
  map[duomoCenterY][duomoCenterX] = {
    type: TILE_TYPE.NPC,
    id: "npc_duomo",
  };

  const villaNpcY = villaTop + 2;
  const villaNpcX = villaCenterX;
  map[villaNpcY][villaNpcX] = {
    type: TILE_TYPE.NPC,
    id: "npc_villa",
  };

  map[height - 3][centerX + 2] = {
    type: TILE_TYPE.NPC,
    id: "npc_porta_troia",
  };

  return map;
}

// =======================
//   DIALOGHI NPC
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
//    QUEST TEXT
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
//  ENCOUNTER LOGIC
// =======================
function isRandomEncounterTile(tileType) {
  return tileType === TILE_TYPE.GRASS || tileType === TILE_TYPE.HOUSE;
}

const ENCOUNTER_CHANCE = 0.18;

// =======================
//  QUIZ PORTE / OGGETTI
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
//  DANNI & EQUIP
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
//  INTERIOR MAP HELPER
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

// =======================
//       APP
// =======================
export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [mode, setMode] = useState("start"); // "start" | "world" | "dialog" | "battle" | "quiz" | "shop" | "gameover"
  const [scene, setScene] = useState("world"); // "world" | "duomo" | "castle" | "villa" | "amphi"

  const [map] = useState(() => createLuceraMap(MAP_WIDTH, MAP_HEIGHT));

  const [player, setPlayer] = useState(() => ({
    x: Math.floor(MAP_WIDTH / 2),
    y: MAP_HEIGHT - 3,
  }));

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

  const [battleTurn, setBattleTurn] = useState(null); // "player" | "enemy"
  const [playerTimer, setPlayerTimer] = useState(0);
  const [enemyCountdown, setEnemyCountdown] = useState(0);
  const [parryQueued, setParryQueued] = useState(false);

  const [inventory, setInventory] = useState({
    potion: 0,
    megapotion: 0,
    sword: 0,
    shield: 0,
  });

  const [equipment, setEquipment] = useState({
    weapon: null,
    shield: null,
  });

  const [showInventory, setShowInventory] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  const [coins, setCoins] = useState(0);

  const [questStep, setQuestStep] = useState(0);
  const [doorsVisited, setDoorsVisited] = useState({
    porta_troia: false,
    porta_foggia: false,
    porta_albana: false,
    porta_san_severo: false,
    porta_san_giacomo: false,
  });
  const [doorRewards, setDoorRewards] = useState({
    porta_troia: false,
    porta_foggia: false,
    porta_albana: false,
    porta_san_severo: false,
    porta_san_giacomo: false,
  });

  const [quiz, setQuiz] = useState(null);

  const [minibossDefeated, setMinibossDefeated] = useState({
    duomo: false,
    villa: false,
    amphi: false,
  });
  const [finalBossDefeated, setFinalBossDefeated] = useState(false);

  const [battleContext, setBattleContext] = useState({
    type: null, // "random" | "miniboss_duomo" | "miniboss_villa" | "miniboss_amphi" | "final_boss"
  });

  const [isGameOver, setIsGameOver] = useState(false);
  const [allQuestsCompletedShown, setAllQuestsCompletedShown] = useState(false);

  // =======================
  //  RESET GAME
  // =======================
  function resetGame() {
    setPlayer({
      x: Math.floor(MAP_WIDTH / 2),
      y: MAP_HEIGHT - 3,
    });
    setMode("world");
    setScene("world");
    setCurrentDialog(null);
    setPlayerStats({
      hp: 30,
      maxHp: 30,
      attack: 5,
    });
    setEnemyStats(null);
    setBattleStats({ damageDealt: 0, damageTaken: 0 });
    setBattleTurn(null);
    setPlayerTimer(0);
    setEnemyCountdown(0);
    setParryQueued(false);
    setInventory({
      potion: 0,
      megapotion: 0,
      sword: 0,
      shield: 0,
    });
    setEquipment({
      weapon: null,
      shield: null,
    });
    setShowInventory(false);
    setShowEquipment(false);
    setShopOpen(false);
    setCoins(0);
    setQuestStep(0);
    setDoorsVisited({
      porta_troia: false,
      porta_foggia: false,
      porta_albana: false,
      porta_san_severo: false,
      porta_san_giacomo: false,
    });
    setDoorRewards({
      porta_troia: false,
      porta_foggia: false,
      porta_albana: false,
      porta_san_severo: false,
      porta_san_giacomo: false,
    });
    setQuiz(null);
    setMinibossDefeated({
      duomo: false,
      villa: false,
      amphi: false,
    });
    setFinalBossDefeated(false);
    setBattleContext({ type: null });
    setIsGameOver(false);
    setAllQuestsCompletedShown(false);
  }

  function handleGameOver() {
    setMode("gameover");
    setScene("world");
    setEnemyStats(null);
    setBattleTurn(null);
    setParryQueued(false);
    setIsGameOver(true);
  }

  function canStartFinalBoss() {
    return (
      inventory.sword > 0 &&
      inventory.shield > 0 &&
      inventory.potion > 0 &&
      inventory.megapotion > 0
    );
  }

  // =======================
  //   MOVIMENTO + TASTI
  // =======================
  useEffect(() => {
    function handleKeyDown(e) {
      // schermata iniziale o game over → nessun movimento
      if (mode === "start" || mode === "gameover") {
        return;
      }

      // parata con S durante turno nemico
      if (mode === "battle" && battleTurn === "enemy") {
        if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          if (equipment.shield === "shield") {
            setParryQueued(true);
          }
          return;
        }
      }

      // modalità con cui NON si deve muovere
      if (mode === "quiz" || mode === "dialog" || mode === "battle" || mode === "shop") {
        if (mode === "quiz" && e.key === "Escape") {
          e.preventDefault();
          setMode("world");
          setQuiz(null);
        }
        return;
      }

      // toggle inventario / equip (solo quando siamo in controllo, modalità world)
      if (mode === "world" && scene === "world") {
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

      // ESC/Invio negli interni per uscire
      if (scene !== "world" && (e.key === "Enter" || e.key === "Escape")) {
        e.preventDefault();
        if (mode === "world") {
          setScene("world");
        }
        return;
      }

      // tasti speciali nelle mini-mappe (B e M)
      if (scene !== "world" && mode === "world") {
        // Bazar nel Duomo
        if ((e.key === "b" || e.key === "B") && scene === "duomo") {
          e.preventDefault();
          setShopOpen(true);
          setMode("shop");
          return;
        }

        // Miniboss / Boss
        if (e.key === "m" || e.key === "M") {
          e.preventDefault();

          if (scene === "duomo") {
            if (minibossDefeated.duomo) {
              alert("Hai già sconfitto il miniboss del Duomo!");
              return;
            }
            startBattle("miniboss_duomo", {
              name: "Miniboss del Duomo",
              hp: 25,
              maxHp: 25,
              attack: 4,
            });
            return;
          }

          if (scene === "villa") {
            if (minibossDefeated.villa) {
              alert("Hai già sconfitto il miniboss della Villa!");
              return;
            }
            startBattle("miniboss_villa", {
              name: "Miniboss della Villa",
              hp: 28,
              maxHp: 28,
              attack: 5,
            });
            return;
          }

          if (scene === "amphi") {
            if (minibossDefeated.amphi) {
              alert("Hai già sconfitto il miniboss dell'Anfiteatro!");
              return;
            }
            startBattle("miniboss_amphi", {
              name: "Miniboss dell'Anfiteatro",
              hp: 30,
              maxHp: 30,
              attack: 5,
            });
            return;
          }

          if (scene === "castle") {
            if (finalBossDefeated) {
              alert("Hai già sconfitto il boss del Castello!");
              return;
            }
            if (!canStartFinalBoss()) {
              setMode("dialog");
              setCurrentDialog({
                text:
                  "Il potere del castello ti respinge. Ti servono almeno una spada, uno scudo, una pozione e una megapozione per affrontare questo boss.",
              });
              return;
            }
            startBattle("final_boss", {
              name: "Boss del Castello",
              hp: 45,
              maxHp: 45,
              attack: 7,
            });
            return;
          }
        }
      }

      // Invio sul mondo per entrare negli interni
      if (scene === "world" && e.key === "Enter") {
        e.preventDefault();
        if (mode !== "world") return;

        const tileRaw = map[player.y][player.x];
        const tileType = tileRaw?.type || tileRaw;

        if (tileType === TILE_TYPE.DUOMO) setScene("duomo");
        else if (tileType === TILE_TYPE.CASTLE) setScene("castle");
        else if (tileType === TILE_TYPE.VILLA) setScene("villa");
        else if (tileType === TILE_TYPE.AMPHI) setScene("amphi");

        return;
      }

      // se siamo in un interno, nessun movimento (scelta: le mini-mappe sono esplorate via tasti B/M)
      if (scene !== "world") return;

      // movimento sul mondo
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

      if (tile === TILE_TYPE.WALL) return;

      // NPC
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

      // random encounter fuori dalle strade
      const tileType = tile?.type || tile;
      if (isRandomEncounterTile(tileType)) {
        if (Math.random() < ENCOUNTER_CHANCE) {
          setPlayer({ x: newX, y: newY });
          startBattle("random");
          return;
        }
      }

      setPlayer({ x: newX, y: newY });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    player,
    map,
    mode,
    questStep,
    scene,
    doorRewards,
    equipment,
    battleTurn,
    inventory,
    minibossDefeated,
    finalBossDefeated,
  ]);

  // =======================
  // BATTAGLIA
  // =======================
  function startBattle(type = "random", enemyOverride) {
    setMode("battle");
    setBattleStats({ damageDealt: 0, damageTaken: 0 });
    setParryQueued(false);

    const enemy =
      enemyOverride || {
        name: "Spirito della pianura",
        hp: 15,
        maxHp: 15,
        attack: 3,
      };

    setEnemyStats(enemy);
    setBattleContext({ type });

    const playerStarts = Math.random() < 0.5;
    setBattleTurn(playerStarts ? "player" : "enemy");
  }

  // Timer turno giocatore (10s max)
  useEffect(() => {
    if (mode !== "battle" || battleTurn !== "player") return;

    setPlayerTimer(10);
    const id = setInterval(() => {
      setPlayerTimer((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          // turno perso → passa al nemico
          setBattleTurn("enemy");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [mode, battleTurn]);

  // Conto alla rovescia attacco nemico
  useEffect(() => {
    if (mode !== "battle" || battleTurn !== "enemy" || !enemyStats) return;

    setEnemyCountdown(3);
    setParryQueued(false);

    const id = setInterval(() => {
      setEnemyCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          enemyAttack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, battleTurn, enemyStats]);

  function enemyAttack() {
    if (!enemyStats) return;

    let damage;
    if (parryQueued && equipment.shield === "shield") {
      damage = 0; // parata perfetta
    } else {
      damage = Math.min(
        playerStats.hp,
        getDamageToPlayer(enemyStats.attack, equipment)
      );
    }

    const newHp = playerStats.hp - damage;

    setBattleStats((prev) => ({
      ...prev,
      damageTaken: prev.damageTaken + damage,
    }));

    if (newHp <= 0) {
      setPlayerStats((prev) => ({ ...prev, hp: 0 }));
      handleGameOver();
    } else {
      setPlayerStats((prev) => ({ ...prev, hp: newHp }));
      setBattleTurn("player");
    }

    setParryQueued(false);
  }

  function finishBattleWithVictory() {
    const type = battleContext.type || "random";

    if (type === "random") {
      // 40% chance di moneta
      let extraMsg = "";
      if (Math.random() < 0.4) {
        setCoins((c) => c + 1);
        extraMsg = "\nHai trovato una moneta!";
      }

      alert(
        `Hai vinto la battaglia contro ${enemyStats.name}!\n` +
          `Hai inflitto ${battleStats.damageDealt} danni e hai subito ${battleStats.damageTaken} danni.` +
          extraMsg
      );
    } else if (type === "miniboss_duomo") {
      setMinibossDefeated((prev) => ({ ...prev, duomo: true }));
      alert(
        `Hai sconfitto il miniboss del Duomo!\nDanni inflitti: ${battleStats.damageDealt}, danni subiti: ${battleStats.damageTaken}.`
      );
    } else if (type === "miniboss_villa") {
      setMinibossDefeated((prev) => ({ ...prev, villa: true }));
      alert(
        `Hai sconfitto il miniboss della Villa!\nDanni inflitti: ${battleStats.damageDealt}, danni subiti: ${battleStats.damageTaken}.`
      );
    } else if (type === "miniboss_amphi") {
      setMinibossDefeated((prev) => ({ ...prev, amphi: true }));
      alert(
        `Hai sconfitto il miniboss dell'Anfiteatro!\nDanni inflitti: ${battleStats.damageDealt}, danni subiti: ${battleStats.damageTaken}.`
      );
    } else if (type === "final_boss") {
      setFinalBossDefeated(true);
      alert(
        `Hai sconfitto il Boss del Castello!\nDanni inflitti: ${battleStats.damageDealt}, danni subiti: ${battleStats.damageTaken}.`
      );
    }

    setMode("world");
    setEnemyStats(null);
    setBattleTurn(null);
    setParryQueued(false);
    setBattleContext({ type: null });
  }

  function handlePlayerAttack() {
    if (mode !== "battle" || battleTurn !== "player" || !enemyStats) return;

    const effectiveAttack = getEffectiveAttack(playerStats, equipment);

    setEnemyStats((prevEnemy) => {
      if (!prevEnemy) return prevEnemy;

      const damageThisHit = Math.min(prevEnemy.hp, effectiveAttack);
      const newEnemyHp = prevEnemy.hp - damageThisHit;

      setBattleStats((prev) => ({
        ...prev,
        damageDealt: prev.damageDealt + damageThisHit,
      }));

      if (newEnemyHp <= 0) {
        // vittoria
        finishBattleWithVictory();
        return null;
      }

      // passa al nemico
      setBattleTurn("enemy");
      return { ...prevEnemy, hp: newEnemyHp };
    });
  }

  function handleBattleRun() {
    if (mode !== "battle") return;

    const fleeDamage = 5;
    const actualDamage = Math.min(playerStats.hp, fleeDamage);
    const newHp = playerStats.hp - actualDamage;

    alert(
      `Sei fuggito dalla battaglia ma hai subito ${actualDamage} danni durante la fuga.`
    );

    setPlayerStats((prev) => ({ ...prev, hp: newHp }));

    if (newHp <= 0) {
      handleGameOver();
    } else {
      setMode("world");
      setEnemyStats(null);
      setBattleTurn(null);
      setParryQueued(false);
      setBattleContext({ type: null });
    }
  }

  // =======================
  // USO OGGETTI
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
    setPlayerStats((prev) => ({
      ...prev,
      hp: Math.min(prev.maxHp, prev.hp + heal),
    }));
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
  // SHOP (BAZAR)
  // =======================
  const POTION_PRICE = 3;
  const MEGAPOTION_PRICE = 5;

  function handleBuyPotion() {
    if (coins < POTION_PRICE) {
      alert("Non hai abbastanza monete per comprare una pozione.");
      return;
    }
    setCoins((c) => c - POTION_PRICE);
    setInventory((prev) => ({ ...prev, potion: prev.potion + 1 }));
  }

  function handleBuyMegapotion() {
    if (coins < MEGAPOTION_PRICE) {
      alert("Non hai abbastanza monete per comprare una megapozione.");
      return;
    }
    setCoins((c) => c - MEGAPOTION_PRICE);
    setInventory((prev) => ({ ...prev, megapotion: prev.megapotion + 1 }));
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
  //  QUEST COMPLETION CHECK
  // =======================
  useEffect(() => {
    if (!playerName || allQuestsCompletedShown) return;

    const mainQuestDone = questStep >= 3;
    const allDoorsVisited = Object.values(doorsVisited).every(Boolean);
    const allMiniboss = Object.values(minibossDefeated).every(Boolean);
    const finalDone = finalBossDefeated;

    if (mainQuestDone && allDoorsVisited && allMiniboss && finalDone) {
      alert(
        `Complimenti ${playerName}, hai completato tutte le quest. Tu sì, che sei un vero lucerino!`
      );
      setAllQuestsCompletedShown(true);
    }
  }, [
    playerName,
    questStep,
    doorsVisited,
    minibossDefeated,
    finalBossDefeated,
    allQuestsCompletedShown,
  ]);

  // =======================
  // RENDER
  // =======================
  const questText = getQuestObjective(questStep);

  const doorsCount = Object.values(doorsVisited).filter(Boolean).length;
  const doorsQuestText =
    doorsCount === 5
      ? "Quest 2: hai visitato tutte le porte di Lucera! 🎉"
      : `Quest 2: porte visitate ${doorsCount}/5`;

  const minibossCount = Object.values(minibossDefeated).filter(Boolean).length;
  const secondaryQuestText =
    minibossCount === 3 && finalBossDefeated
      ? "Quest 3: tutti i miniboss e il boss finale sono stati sconfitti! 🎉"
      : `Quest 3: miniboss sconfitti ${minibossCount}/3, boss finale ${
          finalBossDefeated ? "✔️" : "✖️"
        }`;

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
  } else {
    enterHint =
      'Sei in una mini-mappa: premi "B" per il bazar (nel Duomo), "M" per cercare un miniboss/boss, "Invio" o "Esc" per uscire.';
  }

  let mainView = null;
  if (scene === "world") {
    mainView = <WorldMap map={map} player={player} />;
  } else {
    mainView = <InteriorMap scene={scene} />;
  }

  // SCHERMATA INIZIALE
  if (mode === "start") {
    return (
      <div className="game-root">
        <StartScreen
          playerName={playerName}
          setPlayerName={setPlayerName}
          onStart={() => setMode("world")}
        />
      </div>
    );
  }

  return (
    <div className="game-root">
      <h1 className="title">Mini RPG Lucera</h1>

      <div className="hud">
        <span>Giocatore: {playerName || "-"}</span>
        <span>
          HP: {playerStats.hp} / {playerStats.maxHp}
        </span>
        <span>ATT: {effectiveAttack}</span>
        <span>Monete: {coins}</span>
        <span>Modalità: {mode}</span>
        <span>Turno: {battleTurn || "-"}</span>
        <span>Scena: {scene}</span>
        <span>
          Posizione: ({player.x}, {player.y})
        </span>
      </div>

      <div className="quest">
        <div>{questText}</div>
        <div>{doorsQuestText}</div>
        <div>{secondaryQuestText}</div>
      </div>

      {enterHint && <div className="enter-hint">{enterHint}</div>}

      {/* Pannelli solo in world */}
      {mode === "world" && scene === "world" && showInventory && (
        <InventoryPanel
          inventory={inventory}
          onUsePotion={usePotion}
          onUseMegapotion={useMegapotion}
          onClose={() => setShowInventory(false)}
        />
      )}

      {mode === "world" && scene === "world" && showEquipment && (
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

      {mode === "shop" && shopOpen && (
        <ShopDialog
          coins={coins}
          potionPrice={POTION_PRICE}
          megapotionPrice={MEGAPOTION_PRICE}
          onBuyPotion={handleBuyPotion}
          onBuyMegapotion={handleBuyMegapotion}
          onClose={() => {
            setShopOpen(false);
            setMode("world");
          }}
        />
      )}

      {mode === "battle" && enemyStats && (
        <BattleScreen
          playerStats={playerStats}
          effectiveAttack={effectiveAttack}
          equipment={equipment}
          enemy={enemyStats}
          battleTurn={battleTurn}
          playerTimer={playerTimer}
          enemyCountdown={enemyCountdown}
          onAttack={handlePlayerAttack}
          onUsePotion={usePotion}
          onUseMegapotion={useMegapotion}
          onRun={handleBattleRun}
        />
      )}

      {isGameOver && (
        <GameOverScreen
          playerName={playerName}
          onRestart={resetGame}
          onQuit={() => {
            window.close();
          }}
        />
      )}

      <ControlsHint />
    </div>
  );
}

// =======================
//   WORLD MAP (con camera)
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
//   DIALOG, QUIZ, SHOP & BATTLE UI
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

function ShopDialog({
  coins,
  potionPrice,
  megapotionPrice,
  onBuyPotion,
  onBuyMegapotion,
  onClose,
}) {
  return (
    <div className="overlay">
      <div className="dialog-box">
        <h2>Bazar del Duomo</h2>
        <p>Monete disponibili: {coins}</p>
        <div className="shop-items">
          <div>
            <p>Pozione (+10 HP) – costo: {potionPrice} monete</p>
            <button onClick={onBuyPotion}>Compra Pozione</button>
          </div>
          <div>
            <p>Megapozione (HP completi) – costo: {megapotionPrice} monete</p>
            <button onClick={onBuyMegapotion}>Compra Megapozione</button>
          </div>
        </div>
        <button onClick={onClose}>Chiudi</button>
      </div>
    </div>
  );
}

function BattleScreen({
  playerStats,
  effectiveAttack,
  equipment,
  enemy,
  battleTurn,
  playerTimer,
  enemyCountdown,
  onAttack,
  onUsePotion,
  onUseMegapotion,
  onRun,
}) {
  const isPlayerTurn = battleTurn === "player";

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

        <div className="battle-turn-info">
          {isPlayerTurn ? (
            <p>
              È il <b>tuo turno</b> – tempo rimasto: {playerTimer}s
            </p>
          ) : (
            <p>
              Turno del nemico – attacco tra: {enemyCountdown}s
              {equipment.shield === "shield" && (
                <>
                  {" "}
                  (premi <b>S</b> in questo lasso di tempo per provare a
                  parare!)
                </>
              )}
            </p>
          )}
        </div>

        <div className="battle-actions">
          <button onClick={onAttack} disabled={!isPlayerTurn}>
            Attacca
          </button>
          <button onClick={onUsePotion} disabled={!isPlayerTurn}>
            Usa Pozione
          </button>
          <button onClick={onUseMegapotion} disabled={!isPlayerTurn}>
            Usa Megapozione
          </button>
          <button onClick={onRun} disabled={!isPlayerTurn}>
            Fuggi
          </button>
        </div>
      </div>
    </div>
  );
}

// =======================
//   GAME OVER SCREEN
// =======================
function GameOverScreen({ playerName, onRestart, onQuit }) {
  return (
    <div className="overlay">
      <div className="dialog-box">
        <h2>Game Over</h2>
        <p>
          {playerName
            ? `${playerName}, sei stato sconfitto. Vuoi ricominciare?`
            : "Sei stato sconfitto. Vuoi ricominciare?"}
        </p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button onClick={onRestart}>Sì</button>
          <button onClick={onQuit}>No</button>
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

        <p>Spade: {inventory.sword}</p>
        <p>Scudi: {inventory.shield}</p>
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

// =======================
//   START SCREEN
// =======================
function StartScreen({ playerName, setPlayerName, onStart }) {
  return (
    <div className="overlay">
      <div className="dialog-box">
        <h2>Benvenuto a Mini RPG Lucera</h2>
        <p>Inserisci il nome del giocatore:</p>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Il tuo nome..."
          style={{ width: "100%", marginBottom: "1rem" }}
        />
        <button onClick={onStart} disabled={!playerName.trim()}>
          Inizia
        </button>
      </div>
    </div>
  );
}

function ControlsHint() {
  return (
    <div className="controls">
      <p>
        Usa <b>WASD</b> o <b>frecce</b> per muoverti sulla mappa principale.{" "}
        Premi <b>Invio</b> quando sei su Duomo, Castello, Villa o Anfiteatro per
        entrare nella mini-mappa, e premi di nuovo <b>Invio</b> o <b>Esc</b> per
        uscire. Nelle mini-mappe premi <b>B</b> (nel Duomo) per aprire il
        bazar e <b>M</b> per cercare un miniboss o il boss del castello. Fuori
        dalle strade puoi incontrare nemici casuali! Premi <b>I</b> per
        inventario, <b>E</b> per equip. In battaglia: hai <b>10s</b> per
        scegliere la tua azione; durante il turno nemico, se hai lo scudo,
        premi <b>S</b> per provare a parare il colpo.
      </p>
    </div>
  );
}
