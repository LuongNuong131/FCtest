<script setup>
import { computed } from "vue";

const props = defineProps({
  player: Object,
});

// Tính chỉ số tổng (OVERALL)
const overallRating = computed(() => {
  const stats = props.player;
  // FIX: Dùng giá trị an toàn 50 nếu data từ DB bị null/undefined
  const pac = stats.pac || 50,
    sho = stats.sho || 50,
    pas = stats.pas || 50,
    dri = stats.dri || 50,
    def = stats.def || 50,
    phy = stats.phy || 50;

  const sum = pac + sho + pas + dri + def + phy;
  const avg = Math.round(sum / 6);
  return avg > 90 ? "99" : avg > 70 ? avg : "70-";
});

const footName = computed(() => {
  switch (props.player.dominantFoot) {
    case "Right":
      return "Chân Phải";
    case "Left":
      return "Chân Trái";
    case "Both":
      return "Hai chân";
    default:
      return "Chưa rõ";
  }
});
</script>

<template>
  <div
    class="relative w-72 h-[34rem] bg-gray-900 rounded-3xl shadow-2xl shadow-black/50 transform hover:scale-105 transition-all duration-500 cursor-pointer select-none font-sans text-white border border-gray-800 overflow-hidden"
  >
    <div
      class="absolute top-0 left-0 right-0 p-5 flex justify-between items-center bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50"
    >
      <div class="text-4xl font-black text-white leading-none drop-shadow-md">
        {{ overallRating }}
      </div>
      <div class="text-lg font-bold text-gray-400 uppercase">
        {{ player.position.substring(0, 3) }}
      </div>
    </div>

    <div
      class="absolute top-16 left-1/2 transform -translate-x-1/2 w-40 h-40 mt-5"
    >
      <img
        :src="player.imageUrl || 'https://placehold.co/150'"
        class="w-full h-full object-cover object-top rounded-full border-4 border-gray-700 shadow-xl shadow-black/50"
      />
    </div>

    <div class="absolute top-[15.5rem] w-full text-center px-6">
      <h2
        class="text-xl font-black text-white uppercase tracking-wider pb-1 mx-2 border-b border-gray-700/50 truncate"
      >
        {{ player.name }}
      </h2>
      <div class="text-sm text-gray-500 mt-2 font-mono">{{ footName }}</div>
    </div>

    <div
      class="absolute bottom-10 w-full px-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-bold text-gray-300"
    >
      <div class="stat-row">
        <span class="text-gray-500">PAC (Tốc độ)</span>
        <span class="stat-value text-white">{{ player.pac || 50 }}</span>
      </div>
      <div class="stat-row">
        <span class="text-gray-500">DRI (Rê bóng)</span>
        <span class="stat-value text-white">{{ player.dri || 50 }}</span>
      </div>

      <div class="stat-row">
        <span class="text-gray-500">SHO (Sút)</span>
        <span class="stat-value text-white">{{ player.sho || 50 }}</span>
      </div>
      <div class="stat-row">
        <span class="text-gray-500">DEF (Phòng ngự)</span>
        <span class="stat-value text-white">{{ player.def || 50 }}</span>
      </div>

      <div class="stat-row">
        <span class="text-gray-500">PAS (Chuyền)</span>
        <span class="stat-value text-white">{{ player.pas || 50 }}</span>
      </div>
      <div class="stat-row">
        <span class="text-gray-500">PHY (Thể lực)</span>
        <span class="stat-value text-white">{{ player.phy || 50 }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-row {
  @apply flex justify-between items-center;
}
.stat-value {
  @apply text-xl font-black text-white;
}
</style>
