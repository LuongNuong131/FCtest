<script setup>
import { ref, onMounted, computed } from "vue";
import { useAttendanceStore } from "@/stores/attendanceStore";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";

const attendanceStore = useAttendanceStore();
const authStore = useAuthStore();
const toast = useToastStore();

const newSession = ref({
  date: new Date().toISOString().split("T")[0],
  note: "",
});
const creating = ref(false);

const activeSessions = computed(() =>
  attendanceStore.sessions.filter((s) => s.status === "OPEN")
);
const historySessions = computed(() =>
  attendanceStore.sessions.filter((s) => s.status !== "OPEN")
);

const isCheckedIn = (session) => {
  if (!authStore.user?.playerId) return false;
  return session.attendees?.some((p) => p.id === authStore.user.playerId);
};

const handleCreateSession = async () => {
  if (!newSession.value.date) return toast.warning("Vui lòng chọn ngày!");

  creating.value = true;
  // Gọi hàm createSession từ store
  const success = await attendanceStore.createSession(newSession.value);
  creating.value = false;

  if (success) {
    toast.success("Đã mở cổng điểm danh! 🚀");
    newSession.value.note = ""; // Reset form
  }
};

const handleCheckIn = async (sessionId) => {
  const success = await attendanceStore.selfCheckIn(sessionId);
  if (success) toast.success("Điểm danh thành công! ✅");
  else toast.error("Lỗi điểm danh, thử lại sau!");
};

const handleCloseSession = async (sessionId) => {
  if (confirm("Chốt sổ buổi này? Cầu thủ sẽ không thể điểm danh nữa.")) {
    await attendanceStore.closeSession(sessionId);
    toast.info("Đã chốt sổ.");
  }
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

onMounted(() => {
  attendanceStore.fetchSessions();
});
</script>

<template>
  <div class="space-y-6 pb-24 px-2 md:px-0">
    <div
      class="bg-gradient-to-br from-green-600 to-teal-700 rounded-[2.5rem] p-8 shadow-xl text-white relative overflow-hidden"
    >
      <div
        class="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4"
      >
        <svg class="w-64 h-64" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path
            fill-rule="evenodd"
            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <h1
        class="text-3xl md:text-5xl font-black flex items-center z-10 relative mb-2"
      >
        <span class="mr-4 text-4xl md:text-6xl">📅</span> ĐIỂM DANH
      </h1>
      <p class="text-green-100 text-lg font-medium z-10 relative max-w-md">
        Quản lý lịch tập luyện và điểm danh thành viên.
      </p>
    </div>

    <div
      v-if="authStore.isAdmin"
      class="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-indigo-500/30"
    >
      <h3 class="text-xl font-bold text-white mb-4 flex items-center">
        <span
          class="bg-indigo-500/20 text-indigo-400 p-2 rounded-xl mr-3 border border-indigo-500/30"
          >👑</span
        >
        Tạo Buổi Tập Mới
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            class="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider"
            >Ngày tập</label
          >
          <input
            v-model="newSession.date"
            type="date"
            class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label
            class="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider"
            >Ghi chú</label
          >
          <input
            v-model="newSession.note"
            type="text"
            placeholder="VD: Kèo căng, sân 7..."
            class="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>
      <button
        @click="handleCreateSession"
        :disabled="creating"
        class="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg shadow-indigo-900/50 transition-all active:scale-95 flex justify-center items-center gap-2"
      >
        <span v-if="creating" class="animate-spin">⏳</span>
        {{ creating ? "Đang khởi tạo..." : "＋ MỞ CỔNG ĐIỂM DANH" }}
      </button>
    </div>

    <div v-if="activeSessions.length > 0" class="space-y-4">
      <h3 class="text-xl font-bold text-green-400 flex items-center gap-2 px-2">
        <span class="relative flex h-3 w-3">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
          ></span>
          <span
            class="relative inline-flex rounded-full h-3 w-3 bg-green-500"
          ></span>
        </span>
        Đang Mở Check-in
      </h3>

      <div
        v-for="session in activeSessions"
        :key="session.id"
        class="bg-slate-800 rounded-3xl shadow-xl border border-green-500/30 overflow-hidden"
      >
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h4 class="text-3xl font-black text-white mb-1">
                {{ formatDate(session.date) }}
              </h4>
              <p class="text-green-400 font-medium text-lg">
                {{ session.note || "Buổi tập thường" }}
              </p>
            </div>
            <span
              class="px-4 py-1.5 bg-green-500/20 text-green-400 text-xs font-black rounded-full uppercase tracking-widest border border-green-500/30"
              >OPEN</span
            >
          </div>

          <div class="flex flex-col gap-3">
            <button
              v-if="!isCheckedIn(session)"
              @click="handleCheckIn(session.id)"
              class="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:to-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-green-900/20 active:scale-95 transition-all flex items-center justify-center text-xl group"
            >
              <span
                class="mr-3 text-2xl group-hover:scale-110 transition-transform"
                >🙋‍♂️</span
              >
              BÁO DANH NGAY
            </button>
            <div
              v-else
              class="w-full py-4 bg-green-900/30 text-green-400 font-bold rounded-2xl border border-green-500/30 flex items-center justify-center gap-2"
            >
              <span class="text-xl">✅</span> Bạn đã có mặt
            </div>

            <button
              v-if="authStore.isAdmin"
              @click="handleCloseSession(session.id)"
              class="w-full py-3 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-red-900/30 hover:text-red-400 hover:border-red-500/30 border border-transparent transition-all text-sm"
            >
              🔒 Chốt sổ (Admin)
            </button>
          </div>

          <div class="mt-6 pt-6 border-t border-white/10">
            <p
              class="text-xs text-slate-400 font-bold uppercase mb-3 flex justify-between"
            >
              <span>Đã tham gia</span>
              <span class="text-white"
                >{{ session.attendees?.length || 0 }} người</span
              >
            </p>
            <div class="flex flex-wrap gap-2">
              <img
                v-for="p in session.attendees"
                :key="p.id"
                :src="p.image_url || 'https://placehold.co/100'"
                class="w-12 h-12 rounded-full border-2 border-slate-800 object-cover bg-slate-700 hover:scale-110 transition-transform cursor-help"
                :title="p.name"
              />
              <div
                v-if="!session.attendees?.length"
                class="text-sm text-slate-500 italic w-full text-center py-2"
              >
                Chưa có ai điểm danh...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="historySessions.length > 0" class="mt-10">
      <h3 class="text-xl font-bold text-slate-300 mb-4 px-2">
        Lịch Sử Hoạt Động
      </h3>
      <div class="space-y-3">
        <div
          v-for="session in historySessions"
          :key="session.id"
          class="bg-slate-800/50 p-5 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-slate-800 transition-colors"
        >
          <div>
            <div class="font-bold text-white text-lg">
              {{ formatDate(session.date) }}
            </div>
            <div class="text-sm text-slate-500 truncate max-w-[200px]">
              {{ session.note }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-base font-bold text-indigo-400">
              {{ session.attendees.length }} người
            </div>
            <div class="text-[10px] text-slate-500 uppercase font-bold">
              Đã chốt
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
