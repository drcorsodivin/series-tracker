// Простейший редактор паттернов с под-вкладками
const SettingsNamingTab = {
  template: `
    <div class="settings-tab-content">
      <ul class="nav modern-nav-tabs mb-3">
        <li class="nav-item" v-for="t in tabs" :key="t.key">
          <button class="nav-link modern-tab-link" :class="{active:activeSubTab===t.key}" @click="activeSubTab=t.key">{{t.label}}</button>
        </li>
      </ul>
      <div class="fieldset-content">
        <ul class="list-group mb-3">
          <li v-for="(p,i) in patterns[activeSubTab]" :key="i" class="list-group-item d-flex justify-content-between align-items-center">
            <span class="text-break">{{p}}</span>
            <button class="btn btn-sm btn-outline-danger" @click="removePattern(i)"><i class="bi bi-trash"></i></button>
          </li>
          <li v-if="!patterns[activeSubTab]?.length" class="list-group-item text-muted text-center">Нет паттернов</li>
        </ul>
        <div class="input-group mb-3">
          <input type="text" class="form-control" v-model="newPattern" placeholder="Новый паттерн">
          <button class="btn btn-outline-primary" @click="addPattern" :disabled="!newPattern.trim()">Добавить</button>
        </div>
        <button class="btn btn-primary" :disabled="isSaving" @click="save">
          <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>Сохранить
        </button>
      </div>
    </div>`,
  data(){return{
    tabs:[{key:'series',label:'Паттерны серии'},{key:'season',label:'Паттерны сезона'},{key:'quality',label:'Паттерны качества'},{key:'resolution',label:'Паттерны разрешения'}],
    activeSubTab:'series',
    patterns:{series:[],season:[],quality:[],resolution:[]},
    newPattern:'', isSaving:false
  }},
  emits:['show-toast'],
  methods:{
    async load(){ try{
      const r=await fetch('/api/naming/patterns'); if(!r.ok) throw new Error('Ошибка загрузки');
      const d=await r.json(); this.patterns=Object.assign({series:[],season:[],quality:[],resolution:[]}, d);
    }catch(e){ this.$emit('show-toast', e.message, 'danger'); }},
    addPattern(){ const t=this.newPattern.trim(); if(!t) return; this.patterns[this.activeSubTab].push(t); this.newPattern=''; },
    removePattern(i){ this.patterns[this.activeSubTab].splice(i,1); },
    async save(){ this.isSaving=true; try{
      const r=await fetch('/api/naming/patterns',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(this.patterns)});
      const d=await r.json(); if(!r.ok||!d.success) throw new Error(d.error||'Ошибка сохранения');
      this.patterns=Object.assign({series:[],season:[],quality:[],resolution:[]}, d.patterns);
      this.$emit('show-toast','Паттерны сохранены.','success');
    }catch(e){ this.$emit('show-toast', e.message, 'danger'); } finally{ this.isSaving=false; } }
  }
};
