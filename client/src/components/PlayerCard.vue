<script setup>
import { computed } from "vue";

const props = defineProps({
  player: Object,
  size: { type: String, default: "normal" },
});

// Tính OVR trung bình
const overall = computed(() => {
  if (!props.player) return 50;
  const { pac, sho, pas, dri, def, phy } = props.player;
  const stats = [pac, sho, pas, dri, def, phy].map((v) => Number(v) || 50);
  return Math.round(stats.reduce((a, b) => a + b, 0) / 6);
});

// Fix: Lấy ảnh (ưu tiên imageUrl, fallback image_url)
const avatarUrl = computed(() => {
  const url = props.player.imageUrl || props.player.image_url;
  if (!url) return "https://placehold.co/150?text=?";
  return url;
});

// Fix: Lấy số áo
const jerseyNum = computed(
  () => props.player.jerseyNumber ?? props.player.jersey_number ?? "?"
);

// Parse Traits
const traits = computed(() => {
  const tJson = props.player.traits_json || props.player.traits;
  if (!tJson) return [];
  try {
    const t = typeof tJson === "string" ? JSON.parse(tJson) : tJson;
    return Array.isArray(t) ? t : [];
  } catch (e) {
    return [];
  }
});

const goldTrait = computed(() => traits.value.find((t) => t.level === "gold"));
const silverTraits = computed(() =>
  traits.value.filter((t) => t.level === "silver")
);
</script>

<template>
  <div
    class="relative group select-none text-[#432f1e] transition-transform hover:scale-[1.02] duration-300"
    :class="
      size === 'large' || size === 'extra-large'
        ? 'w-80 h-[28rem]'
        : 'w-64 h-[22rem]'
    "
  >
    <div
      class="absolute inset-0 bg-gradient-to-b from-[#f9f1d0] via-[#fdfbf3] to-[#cc9b30] rounded-t-[15%] rounded-b-[10%] border-[6px] border-[#e3b956] shadow-2xl overflow-hidden"
    >
      <div
        class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
      ></div>
    </div>

    <div
      class="absolute top-[10%] left-1/2 -translate-x-1/2 w-[85%] h-[55%] z-10"
    >
      <img
        :src="avatarUrl"
        class="w-full h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)] mask-fade-bottom"
        @error="$event.target.src = 'https://placehold.co/150?text=Error'"
      />
    </div>

    <div class="absolute top-[18%] left-[12%] z-20 flex flex-col items-center">
      <span
        class="text-5xl font-black text-[#3b2b1a] leading-none drop-shadow-sm"
        >{{ overall }}</span
      >
      <span class="text-lg font-bold uppercase text-[#3b2b1a] mt-1">{{
        player.position?.substring(0, 3)
      }}</span>
      <div class="w-8 h-[1px] bg-[#3b2b1a]/40 my-1"></div>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg"
        class="w-6 shadow-sm rounded-[2px]"
      />
    </div>

    <div
      v-if="goldTrait"
      class="absolute top-[42%] right-[10%] z-30 animate-bounce-slow"
      title="PlayStyle+"
    >
      <div
        class="w-10 h-10 bg-gradient-to-b from-[#fffacd] to-[#ffd700] rounded-full border-2 border-[#b8860b] shadow-[0_0_15px_rgba(255,215,0,0.6)] flex items-center justify-center p-1.5"
      >
        <img :src="goldTrait.image" class="w-full h-full object-contain" />
      </div>
      <div
        class="absolute -bottom-1 -right-1 text-[8px] font-black bg-black text-[#ffd700] px-1 rounded"
      >
        PS+
      </div>
    </div>

    <div class="absolute top-[58%] right-[10%] z-20 flex flex-col gap-1.5">
      <div
        v-for="t in silverTraits.slice(0, 3)"
        :key="t.id"
        class="w-6 h-6 bg-[#e0e0e0] rounded-full border border-gray-400 flex items-center justify-center p-1 shadow-sm opacity-90 hover:opacity-100 hover:scale-110 transition-all"
      >
        <img
          :src="t.image"
          class="w-full h-full object-contain grayscale"
          :title="t.name"
        />
      </div>
      <div
        v-if="silverTraits.length > 3"
        class="w-6 h-6 bg-white/50 rounded-full flex items-center justify-center text-[10px] font-bold border border-gray-400"
      >
        +{{ silverTraits.length - 3 }}
      </div>
    </div>

    <div
      class="absolute bottom-0 w-full h-[35%] z-20 flex flex-col items-center pt-2"
    >
      <h2
        class="text-2xl font-black uppercase text-[#3b2b1a] tracking-tighter truncate max-w-[90%]"
      >
        {{ player.name }}
      </h2>
      <div class="w-[85%] h-[1px] bg-[#3b2b1a]/20 my-2"></div>

      <div class="grid grid-cols-6 gap-1 w-[85%] text-center text-[#3b2b1a]">
        <div class="flex flex-col">
          <span class="font-bold text-lg">{{ player.pac }}</span
          ><span class="text-[9px] opacity-80 font-semibold">PAC</span>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg">{{ player.sho }}</span
          ><span class="text-[9px] opacity-80 font-semibold">SHO</span>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg">{{ player.pas }}</span
          ><span class="text-[9px] opacity-80 font-semibold">PAS</span>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg">{{ player.dri }}</span
          ><span class="text-[9px] opacity-80 font-semibold">DRI</span>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg">{{ player.def }}</span
          ><span class="text-[9px] opacity-80 font-semibold">DEF</span>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-lg">{{ player.phy }}</span
          ><span class="text-[9px] opacity-80 font-semibold">PHY</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mask-fade-bottom {
  mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
}
.animate-bounce-slow {
  animation: bounce 3s infinite;
}
</style>
