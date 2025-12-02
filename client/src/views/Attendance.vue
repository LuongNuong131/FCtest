<script setup>
import { ref, onMounted, computed } from "vue";
import { useAttendanceStore } from "@/stores/attendanceStore";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import { VERIFY_ICONS } from "@/constants/icons";
import axiosClient from "@/api/axiosClient";
import Modal from "@/components/Modal.vue";

const attendanceStore = useAttendanceStore();
const authStore = useAuthStore();
const toast = useToastStore();

const newSession = ref({
  date: new Date().toISOString().split("T")[0],
  note: "",
});
const selectedSecretIcon = ref("");
const showVerifyModal = ref(false);
const verifyOptions = ref([]);
const selectedVerifyIcon = ref("");
const targetSessionId = ref("");
const isVerifying = ref(false);

const activeSessions = computed(() =>
  attendanceStore.sessions.filter((s) => s.status === "OPEN")
);
const historySessions = computed(() =>
  attendanceStore.sessions.filter((s) => s.status !== "OPEN")
);

const isCheckedIn = (session) => {
  if (!authStore.user?.playerId) return false;
  return session.attendees?.some((p) => p.id == authStore.user.playerId);
};

const handleCreateSession = async () => {
  if (!newSession.value.date) return toast.warning("Chọn ngày!");
  if (!selectedSecretIcon.value) return toast.warning("Chọn mật mã!");

  const success = await attendanceStore.createSession({
    ...newSession.value,
    secretIconId: selectedSecretIcon.value,
  });

  if (success) {
    toast.success("Đã mở cổng điểm danh!");
    newSession.value.note = "";
    selectedSecretIcon.value = "";
  }
};

// Mở Popup và lấy options random từ server
const openVerifyModal = async (sessionId) => {
  targetSessionId.value = sessionId;
  showVerifyModal.value = true;
  selectedVerifyIcon.value = "";
  verifyOptions.value = [];
  isVerifying.value = true;

  try {
    const res = await axiosClient.get(
      `/sessions/verify-options?sessionId=${sessionId}`
    );
    verifyOptions.value = res.data;
  } catch (e) {
    toast.error(
      "Lỗi: " + (e.response?.data?.message || "Không tải được verify")
    );
    showVerifyModal.value = false;
  } finally {
    isVerifying.value = false;
  }
};

const submitCheckIn = async () => {
  if (!selectedVerifyIcon.value) return toast.warning("Vui lòng chọn 1 hình!");

  const res = await attendanceStore.selfCheckIn(
    targetSessionId.value,
    selectedVerifyIcon.value
  );

  if (res.success) {
    toast.success("Điểm danh thành công! ✅");
    showVerifyModal.value = false;
  } else {
    toast.error(res.message);
    showVerifyModal.value = false;
  }
};

onMounted(() => attendanceStore.fetchSessions());
</script>

<template>
  <div class="space-y-6 pb-24 px-2 md:px-0">
    <div
      class="bg-gradient-to-r from-team-green to-teal-600 rounded-[2rem] p-8 shadow-lg text-white relative overflow-hidden"
    >
      <div class="relative z-10">
        <h1
          class="text-3xl md:text-4xl font-black uppercase flex items-center gap-3"
        >
          <span class="text-4xl">📅</span> Điểm Danh
        </h1>
        <p class="text-green-100 font-medium mt-2 opacity-90">
          Check-in để ghi danh vào đội hình ra sân hôm nay!
        </p>
      </div>
      <div
        class="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"
      ></div>
    </div>

    <div
      v-if="authStore.isAdmin"
      class="bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/10"
    >
      <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
        🔐 Tạo Buổi Tập (Admin)
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          v-model="newSession.date"
          type="date"
          class="form-input bg-slate-800 text-white border-slate-700"
        />
        <input
          v-model="newSession.note"
          placeholder="Ghi chú (VD: Sân Cầu Suối...)"
          class="form-input bg-slate-800 text-white border-slate-700"
        />
      </div>

      <p class="text-slate-400 text-xs font-bold uppercase mb-2">
        Chọn Mật Mã Bảo Mật:
      </p>
      <div class="grid grid-cols-5 md:grid-cols-10 gap-2 mb-6">
        <div
          v-for="icon in VERIFY_ICONS"
          :key="icon.id"
          @click="selectedSecretIcon = icon.id"
          class="aspect-square bg-slate-800 rounded-xl flex items-center justify-center cursor-pointer border-2 transition-all hover:bg-slate-700"
          :class="
            selectedSecretIcon === icon.id
              ? 'border-green-500 bg-green-500/20'
              : 'border-transparent'
          "
        >
          <span class="text-2xl">{{ icon.img }}</span>
        </div>
      </div>

      <button
        @click="handleCreateSession"
        class="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
      >
        ＋ MỞ CỔNG ĐIỂM DANH
      </button>
    </div>

    <div v-if="activeSessions.length > 0" class="space-y-6">
      <div
        v-for="session in activeSessions"
        :key="session.id"
        class="bg-slate-800 rounded-3xl shadow-2xl border border-green-500/30 p-6 relative overflow-hidden group"
      >
        <div
          class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-teal-500"
        ></div>

        <div class="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h4 class="text-2xl font-black text-white mb-1">
              {{ new Date(session.date).toLocaleDateString("vi-VN") }}
            </h4>
            <p class="text-green-400 font-bold text-lg">
              {{ session.note || "Buổi tập thường" }}
            </p>
          </div>
          <span
            class="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-black rounded-full animate-pulse border border-green-500/30"
          >
            ĐANG MỞ CỬA
          </span>
        </div>

        <button
          v-if="!isCheckedIn(session)"
          @click="openVerifyModal(session.id)"
          class="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:to-teal-500 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
        >
          <span class="text-xl">🕵️</span> BÁO DANH NGAY
        </button>
        <div
          v-else
          class="w-full py-4 bg-green-900/20 text-green-400 font-bold rounded-2xl border border-green-500/20 flex items-center justify-center gap-2"
        >
          <span class="text-xl">✅</span> Đã ghi danh thành công
        </div>

        <div class="mt-6 pt-6 border-t border-white/5">
          <p class="text-xs text-slate-500 font-bold uppercase mb-3">
            Đã tham gia ({{ session.attendees?.length || 0 }})
          </p>
          <div class="flex flex-wrap gap-2">
            <img
              v-for="p in session.attendees"
              :key="p.id"
              :src="p.imageUrl || '/images/default-avatar.png'"
              class="w-10 h-10 rounded-full border-2 border-slate-700 object-cover bg-slate-800"
              :title="p.name"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="historySessions.length > 0" class="mt-12">
      <h3
        class="text-xl font-bold text-slate-400 mb-4 px-2 uppercase tracking-widest text-xs"
      >
        Lịch Sử Hoạt Động
      </h3>
      <div class="space-y-3">
        <div
          v-for="session in historySessions"
          :key="session.id"
          class="bg-slate-800/50 p-4 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-slate-800 transition-colors"
        >
          <div>
            <div class="font-bold text-white">
              {{ new Date(session.date).toLocaleDateString("vi-VN") }}
            </div>
            <div class="text-xs text-slate-500">{{ session.note }}</div>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold text-indigo-400">
              {{ session.attendees?.length || 0 }} người
            </div>
            <div class="text-[10px] text-slate-600 uppercase font-bold">
              Đã chốt
            </div>
          </div>
        </div>
      </div>
    </div>

    <Modal :show="showVerifyModal" @close="showVerifyModal = false">
      <div class="p-6 text-center">
        <div
          class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
        >
          🕵️
        </div>
        <h2 class="text-2xl font-black text-slate-900 mb-2">TRUY TÌM MẬT MÃ</h2>
        <p class="text-slate-600 mb-6 text-sm font-medium">
          Admin đã đặt 1 icon bí mật. Hãy chọn đúng để điểm danh. <br />
          <span class="text-red-500 font-bold"
            >⚠️ Sai 1 lần là bị chặn vĩnh viễn!</span
          >
        </p>

        <div v-if="isVerifying" class="py-10">
          <div class="animate-spin text-3xl">⏳</div>
        </div>

        <div v-else class="grid grid-cols-3 gap-4 mb-8">
          <div
            v-for="opt in verifyOptions"
            :key="opt.id"
            @click="selectedVerifyIcon = opt.id"
            class="aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer border-4 transition-all hover:scale-105 active:scale-95 bg-slate-50"
            :class="
              selectedVerifyIcon === opt.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-slate-100'
            "
          >
            <span class="text-4xl mb-2">{{ opt.img }}</span>
            <span class="text-[10px] font-bold text-slate-500 uppercase">{{
              opt.name
            }}</span>
          </div>
        </div>

        <button
          @click="submitCheckIn"
          :disabled="isVerifying"
          class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          CHỐT ĐÁP ÁN 🚀
        </button>
      </div>
    </Modal>
  </div>
</template>
