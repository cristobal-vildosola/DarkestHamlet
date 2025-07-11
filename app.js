const { createApp } = Vue;

const LOCAL_STORAGE_KEY = "DarkestHamlet";

const defaultHamlet = {
  buildings: {
    survivalist: 1,
    tavern: 1,
    sanitarium: 1,
    abbey: 1,
    blacksmith: 1,
    nomad_wagon: 1,
    stagecoach: 1,
  },
  gold: 0,
  provisions: 0,
  waitingHeroes: 2,
};

const upgradeCost = {
  survivalist: 20,
  tavern: 20,
  sanitarium: 20,
  abbey: 20,
  blacksmith: 10,
  nomad_wagon: 10,
  stagecoach: 20,
};

createApp({
  data() {
    return {
      hamlets: [{ ...defaultHamlet }],
      currentSave: 0,

      // modals and options
      day: 0,
      blocked: [],
      setting: 0,
      upgrading: false,
      deletingHamlet: false,
      zoom: 0.98,
    };
  },

  mounted() {
    this.loadGame();
  },
  watch: {
    hamlets: {
      handler() {
        this.saveGame();
      },
      deep: true,
    },
    currentSave() {
      this.saveGame();
    },

    setting: {
      handler(value) {
        switch (value) {
          case "export":
            this.exportSave();
            break;
          case "import":
            this.importSave();
            break;
          case "add-hamlet":
            this.hamlets.push({ ...defaultHamlet });
            this.currentSave = this.hamlets.length - 1;
            break;
          case "delete-hamlet":
            this.deletingHamlet = true;
            break;
          default:
            if (typeof value === "number") this.currentSave = value;
        }
        this.setting = this.currentSave;
      },
    },
  },

  computed: {
    current() {
      return this.hamlets[this.currentSave];
    },
    save() {
      return {
        hamlets: this.hamlets,
        currentSave: this.currentSave,
      };
    },

    opened() {
      return this.deletingHamlet || this.upgrading;
    },
  },

  methods: {
    upgradeCost(building) {
      return upgradeCost[building];
    },
    block(building) {
      if (this.blocked.includes(building)) {
        this.blocked = this.blocked.filter((x) => x !== building);
      } else {
        this.blocked.push(building);
      }
    },

    closeModal() {
      this.deletingHamlet = false;
      this.upgrading = false;
    },
    confirm() {
      this.deleteHamlet();
      this.closeModal();
    },

    deleteHamlet() {
      this.hamlets.splice(this.currentSave, 1);
      this.currentSave = 0;
      this.setting = this.currentSave;
    },

    saveGame() {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.save));
    },
    loadGame() {
      const save = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
      if (save) {
        this.load(save);
      }
    },

    exportSave() {
      const save = JSON.stringify(this.save, null, 2);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(save);
      const dlAnchorElem = document.getElementById("export");
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", `${LOCAL_STORAGE_KEY}.json`);
      dlAnchorElem.click();
    },
    importSave() {
      document.getElementById("import").click();
    },
    onFileUpload(event) {
      if (!event.target.files[0]) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const save = JSON.parse(event.target.result);
        this.load(save);
      };
      reader.readAsText(event.target.files[0]);
    },
    load(save) {
      this.hamlets = save.hamlets.map((hamlet) => ({
        ...defaultHamlet,
        ...hamlet,
      }));
      this.currentSave = save.currentSave;
      this.setting = save.currentSave;
    },
  },
}).mount("#app");
