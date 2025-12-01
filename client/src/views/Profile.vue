<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { usePlayerStore } from "@/stores/playerStore";
import { useToastStore } from "@/stores/toastStore";

const authStore = useAuthStore();
const playerStore = usePlayerStore();
const toast = useToastStore();
const loading = ref(false);
const playerData = ref({});

onMounted(async () => {
  await playerStore.fetchPlayers();
  const pid = authStore.user?.playerId;
  if (pid) {
    const p = playerStore.players.find((x) => x.id === pid);
    if (p) {
      playerData.value = { ...p };
      // FIX: Chuyển date từ ISO string/MySQL date sang YYYY-MM-DD cho input
      if (p.dob) {
        const d = new Date(p.dob);
        // Thêm timezone offset để không bị lùi 1 ngày
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        playerData.value.dob = local.toISOString().split("T")[0];
      }
    }
  }
});

const handleUpdate = async () => {
  loading.value = true;
  try {
    await playerStore.updatePlayer(playerData.value.id, playerData.value);
    if (authStore.user.displayName !== playerData.value.name) {
      const updatedUser = {
        ...authStore.user,
        displayName: playerData.value.name,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      authStore.user = updatedUser;
    }
    toast.success("Cập nhật hồ sơ thành công!");
  } catch (e) {
    toast.error("Lỗi: " + e.message);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-20">
    <div
      class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-6 shadow-lg"
    >
      <div class="relative w-32 h-32 flex-shrink-0">
        <img
          :src="playerData.imageUrl || 'https://placehold.co/200'"
          class="w-32 h-32 rounded-full border-4 border-white/30 object-cover bg-gray-300 shadow-lg"
          @error="$event.target.src = 'https://placehold.co/200'"
        />
        <div
          class="absolute bottom-0 right-0 bg-green-500 border-2 border-white w-6 h-6 rounded-full"
        ></div>
      </div>

      <div class="text-center md:text-left">
        <h1 class="text-3xl font-black mb-2">{{ playerData.name }}</h1>
        <div class="flex flex-wrap justify-center md:justify-start gap-2">
          <span
            class="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md"
            >#{{ playerData.jerseyNumber || "?" }}</span
          >
          <span
            class="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md"
            >{{ playerData.position || "Vị trí" }}</span
          >
          <span
            class="bg-yellow-400/20 text-yellow-200 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md border border-yellow-400/50"
            >⭐ {{ playerData.totalAttendance }} Buổi</span
          >
        </div>
      </div>
    </div>

    <div
      class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8"
    >
      <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span class="bg-indigo-100 p-2 rounded-lg mr-2">📝</span> Chỉnh Sửa
        Thông Tin
      </h3>

      <form
        @submit.prevent="handleUpdate"
        class="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-500 uppercase ml-1"
            >Họ Tên</label
          >
          <input v-model="playerData.name" class="form-input w-full" required />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-500 uppercase ml-1"
            >Số Điện Thoại</label
          >
          <input v-model="playerData.phone" class="form-input w-full" />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-500 uppercase ml-1"
            >Ngày Sinh</label
          >
          <input
            v-model="playerData.dob"
            type="date"
            class="form-input w-full"
          />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-bold text-gray-500 uppercase ml-1"
            >Link Ảnh (URL)</label
          >
          <input
            v-model="playerData.imageUrl"
            class="form-input w-full"
            placeholder="/images/players/..."
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-500 uppercase ml-1"
              >Chiều cao (cm)</label
            >
            <input
              v-model="playerData.height_cm"
              type="number"
              class="form-input w-full"
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-500 uppercase ml-1"
              >Cân nặng (kg)</label
            >
            <input
              v-model="playerData.weight_kg"
              type="number"
              class="form-input w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-500 uppercase ml-1"
              >Vị Trí</label
            >
            <select v-model="playerData.position" class="form-input w-full">
              <option value="Forward">Tiền đạo</option>
              <option value="Midfielder">Tiền vệ</option>
              <option value="Defender">Hậu vệ</option>
              <option value="Goalkeeper">Thủ môn</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-bold text-gray-500 uppercase ml-1"
              >Số Áo</label
            >
            <input
              v-model="playerData.jerseyNumber"
              type="number"
              class="form-input w-full"
            />
          </div>
        </div>

        <div
          class="md:col-span-2 flex justify-end mt-4 pt-4 border-t border-gray-100"
        >
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full md:w-auto px-8 py-3 flex justify-center items-center shadow-lg shadow-indigo-200"
          >
            <span v-if="loading" class="animate-spin mr-2">⏳</span>
            {{ loading ? "Đang lưu..." : "Lưu Thay Đổi" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
