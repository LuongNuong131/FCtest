<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePlayerStore } from "@/stores/playerStore";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import PlayerCard from "@/components/PlayerCard.vue";

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();
const authStore = useAuthStore();
const toast = useToastStore();
const player = ref(null);

// Helper lấy dữ liệu linh hoạt (camelCase hoặc snake_case)
const getVal = (key1, key2) => player.value?.[key1] || player.value?.[key2];

const dobDisplay = computed(() => {
  const dob = getVal("dob", "dob");
  if (!dob) return { date: "N/A", age: "??" };
  const dateObj = new Date(dob);
  const ageDiff = Date.now() - dateObj.getTime();
  const ageDate = new Date(ageDiff);
  return {
    date: dateObj.toLocaleDateString("vi-VN"),
    age: Math.abs(ageDate.getUTCFullYear() - 1970),
  };
});

const fitnessPercent = computed(() => {
  const current = getVal("totalAttendance", "total_attendance") || 0;
  return Math.min((current / 20) * 100, 100);
});

const footNameDisplay = computed(() => {
  const foot = getVal("dominantFoot", "dominant_foot");
  if (foot === "Left") return "Chân Trái";
  if (foot === "Both") return "Hai chân";
  return "Chân Phải";
});

const handleDelete = async () => {
  if (!confirm(`Xóa cầu thủ ${player.value.name}?`)) return;
  try {
    await playerStore.deletePlayer(player.value.id);
    toast.success("Đã xóa!");
    router.push("/players");
  } catch (err) {
    toast.error("Lỗi xóa!");
  }
};

onMounted(async () => {
  try {
    player.value = await playerStore.getPlayerById(route.params.id);
  } catch (e) {
    router.push("/players");
  }
});
</script>

<template>
  <div
    v-if="player"
    class="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans"
  >
    <div class="relative z-10 max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-10">
        <button
          @click="router.back()"
          class="px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
        >
          ← QUAY LẠI
        </button>
        <div v-if="authStore.isAdmin" class="flex gap-3">
          <button
            @click="router.push(`/players/${player.id}/edit`)"
            class="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition"
          >
            ✏️
          </button>
          <button
            @click="handleDelete"
            class="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition"
          >
            🗑️
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-5 flex flex-col items-center">
          <div
            class="transform transition hover:scale-105 hover:-rotate-2 duration-500"
          >
            <PlayerCard
              :player="player"
              size="extra-large"
              class="shadow-2xl"
            />
          </div>
        </div>

        <div class="lg:col-span-7 space-y-8">
          <div>
            <h1
              class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500"
            >
              {{ player.name }}
            </h1>
            <div class="flex items-center gap-4 mt-2">
              <span class="text-3xl font-black text-yellow-400"
                >#{{ getVal("jerseyNumber", "jersey_number") }}</span
              >
              <div class="h-8 w-[1px] bg-white/20"></div>
              <span
                class="text-xl font-bold text-indigo-400 uppercase tracking-widest"
                >{{ player.position }}</span
              >
            </div>
          </div>

          <div class="bg-slate-900/50 border border-white/10 p-6 rounded-3xl">
            <div class="flex justify-between items-end mb-2">
              <span class="text-sm font-bold text-slate-400 uppercase"
                >Độ Chuyên Cần</span
              >
              <span class="text-2xl font-black text-green-400"
                >{{ getVal("totalAttendance", "total_attendance") }} trận</span
              >
            </div>
            <div class="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                :style="{ width: `${fitnessPercent}%` }"
              ></div>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              class="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3"
            >
              <div class="text-2xl">🎂</div>
              <div>
                <p class="text-xl font-black">{{ dobDisplay.age }}</p>
                <p class="text-[10px] text-slate-500 uppercase">Tuổi</p>
              </div>
            </div>
            <div
              class="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3"
            >
              <div class="text-2xl">🦶</div>
              <div>
                <p class="text-lg font-black">{{ footNameDisplay }}</p>
                <p class="text-[10px] text-slate-500 uppercase">Chân Thuận</p>
              </div>
            </div>
            <div
              class="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3"
            >
              <div class="text-2xl">📏</div>
              <div>
                <p class="text-xl font-black">
                  {{ getVal("height", "height_cm") }} cm
                </p>
                <p class="text-[10px] text-slate-500 uppercase">Chiều Cao</p>
              </div>
            </div>
            <div
              class="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3"
            >
              <div class="text-2xl">⚖️</div>
              <div>
                <p class="text-xl font-black">
                  {{ getVal("weight", "weight_kg") }} kg
                </p>
                <p class="text-[10px] text-slate-500 uppercase">Cân Nặng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
