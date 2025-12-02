<script setup>
import { onMounted, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { usePlayerStore } from "@/stores/playerStore";
import { useAttendanceStore } from "@/stores/attendanceStore";
import { useAuthStore } from "@/stores/authStore";
import { useFundStore } from "@/stores/fundStore";
import Leaderboard from "@/components/Leaderboard.vue";
import AttendanceDetailModal from "@/components/AttendanceDetailModal.vue";

const router = useRouter();
const playerStore = usePlayerStore();
const attendanceStore = useAttendanceStore();
const authStore = useAuthStore();
const fundStore = useFundStore();
const showModal = ref(false);
const selectedSession = ref(null);

const activeSession = computed(() =>
  attendanceStore.sessions.find((s) => s.status === "OPEN")
);

const isCheckedIn = computed(() =>
  activeSession.value?.attendees?.some((p) => p.id == authStore.user?.playerId)
);

// Chuyển hướng sang trang điểm danh để hiện popup verify
const goToAttendance = () => {
  router.push("/attendance");
};

onMounted(async () => {
  await Promise.all([
    playerStore.fetchPlayers(),
    attendanceStore.fetchSessions(),
    fundStore.fetchFunds(),
  ]);
});

const stats = computed(() => [
  {
    title: "Thành Viên",
    value: playerStore.players.length,
    icon: "👥",
    color: "blue",
    gradient: "from-blue-500 to-cyan-600",
    description: "Cầu thủ đang hoạt động",
  },
  {
    title: "Buổi Tập",
    value: attendanceStore.sessions.length,
    icon: "📅",
    color: "emerald",
    gradient: "from-emerald-500 to-green-600",
    description: "Tổng buổi đã tổ chức",
  },
  {
    title: "Quỹ Đội",
    value: fundStore.formattedBalance,
    icon: "💰",
    color: "amber",
    gradient: "from-amber-500 to-yellow-600",
    description: "VNĐ",
  },
  {
    title: "Trạng Thái",
    value: activeSession.value ? "Đang Đá" : "Nghỉ",
    icon: activeSession.value ? "🔥" : "😴",
    color: activeSession.value ? "rose" : "slate",
    gradient: activeSession.value
      ? "from-rose-500 to-red-600"
      : "from-slate-500 to-gray-600",
    description: activeSession.value ? "Có trận đấu" : "Chưa có lịch",
  },
]);
</script>

<template>
  <div class="space-y-8">
    <div
      v-if="activeSession"
      class="relative overflow-hidden rounded-[2.5rem] shadow-2xl animate-float"
    >
      <div
        class="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700"
      >
        <div
          class="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.3),transparent_50%)]"
        ></div>
      </div>

      <div
        class="relative z-10 p-8 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div class="flex items-center gap-6">
          <div
            class="relative w-20 h-20 flex-shrink-0 animate-bounce-slow filter drop-shadow-2xl"
          >
            <div
              class="text-7xl absolute inset-0 flex items-center justify-center"
            >
              ⚽
            </div>
          </div>
          <div>
            <h2
              class="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-2"
            >
              TRẬN ĐẤU ĐANG DIỄN RA!
            </h2>
            <p class="text-green-100 font-bold text-xl mb-1">
              {{ activeSession.note }}
            </p>
            <div class="flex items-center gap-2">
              <span
                class="inline-block w-3 h-3 bg-white rounded-full animate-pulse"
              ></span>
              <p class="text-white/90 font-bold text-base">
                Đã có
                <span
                  class="text-yellow-300 font-black text-xl px-2 py-0.5 bg-black/20 rounded-lg"
                  >{{ activeSession.attendees?.length }}</span
                >
                cầu thủ
              </p>
            </div>
          </div>
        </div>

        <button
          v-if="!isCheckedIn"
          @click="goToAttendance"
          class="group relative px-12 py-5 bg-white text-green-700 font-black rounded-2xl shadow-2xl hover:shadow-white/50 transition-all duration-300 text-xl overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
          <span class="relative z-10 group-hover:text-white transition-colors"
            >🙋‍♂️ BÁO DANH NGAY</span
          >
        </button>
        <div
          v-else
          class="px-10 py-5 bg-white/20 backdrop-blur-md text-white font-black rounded-2xl border-2 border-white/40 flex items-center gap-3 shadow-lg"
        >
          <span class="text-2xl animate-bounce">✅</span>
          <span class="text-lg">Bạn đã có mặt</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-3 space-y-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            v-for="(s, i) in stats"
            :key="i"
            :class="`group relative overflow-hidden rounded-3xl p-6 shadow-xl border border-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer bg-slate-900/50 backdrop-blur-md`"
          >
            <div
              :class="`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`"
            ></div>
            <div
              :class="`absolute -top-4 -right-4 text-7xl opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 group-hover:rotate-12`"
            >
              {{ s.icon }}
            </div>
            <div class="relative z-10 space-y-4">
              <div class="flex items-center justify-between">
                <h3
                  class="text-xs font-black text-slate-400 uppercase tracking-widest"
                >
                  {{ s.title }}
                </h3>
                <div
                  :class="`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`"
                >
                  {{ s.icon }}
                </div>
              </div>
              <div
                :class="`text-4xl font-black bg-gradient-to-br ${s.gradient} bg-clip-text text-transparent drop-shadow-sm`"
              >
                {{ s.value }}
              </div>
              <p class="text-sm text-slate-400 font-semibold">
                {{ s.description }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          <div
            class="relative p-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-white/5 flex justify-between items-center"
          >
            <div>
              <h3
                class="text-3xl font-black text-white flex items-center gap-3 mb-2"
              >
                <span class="text-4xl">📜</span> Lịch Sử Hoạt Động
              </h3>
              <p class="text-slate-400 text-sm font-medium">
                Các buổi tập gần đây
              </p>
            </div>
            <button
              @click="router.push('/attendance')"
              class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg hover:scale-105"
            >
              Xem tất cả →
            </button>
          </div>
          <div class="divide-y divide-white/5">
            <div
              v-for="session in attendanceStore.sessions.slice(0, 5)"
              :key="session.id"
              class="group p-6 hover:bg-white/5 cursor-pointer transition-all flex items-center justify-between"
              @click="
                selectedSession = session;
                showModal = true;
              "
            >
              <div class="flex items-center gap-6">
                <div
                  class="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex flex-col items-center justify-center text-white shadow-lg group-hover:border-indigo-500/50 transition-all"
                >
                  <span class="text-3xl font-black leading-none">{{
                    new Date(session.date).getDate()
                  }}</span>
                  <span class="text-xs font-bold text-slate-400 uppercase mt-1"
                    >Tháng {{ new Date(session.date).getMonth() + 1 }}</span
                  >
                </div>
                <div>
                  <p
                    class="font-black text-white text-xl group-hover:text-indigo-400 transition-colors mb-1"
                  >
                    {{ session.note || "Buổi tập thường" }}
                  </p>
                  <p class="text-sm text-slate-500 flex items-center gap-2">
                    <span
                      :class="
                        session.status === 'OPEN'
                          ? 'text-green-400'
                          : 'text-slate-600'
                      "
                      >●
                      {{
                        session.status === "OPEN" ? "Đang mở" : "Đã chốt"
                      }}</span
                    >
                  </p>
                </div>
              </div>
              <div class="flex -space-x-4">
                <img
                  v-for="p in session.attendees.slice(0, 4)"
                  :key="p.id"
                  :src="p.image_url || 'https://placehold.co/50'"
                  class="w-12 h-12 rounded-full border-3 border-slate-800 object-cover"
                />
                <div
                  v-if="session.attendees.length > 4"
                  class="w-12 h-12 rounded-full bg-slate-700 border-3 border-slate-800 flex items-center justify-center text-xs font-bold text-white"
                >
                  +{{ session.attendees.length - 4 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="lg:col-span-1 space-y-8">
        <Leaderboard />
      </div>
    </div>
    <AttendanceDetailModal
      :show="showModal"
      :session="selectedSession"
      @close="showModal = false"
    />
  </div>
</template>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}
.animate-bounce-slow {
  animation: bounce 3s infinite;
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}
</style>
