<script setup>
import { onMounted, ref } from "vue";
import { useTeamStore } from "@/stores/teamStore";
import { usePlayerStore } from "@/stores/playerStore";
import { useToastStore } from "@/stores/toastStore";
import axiosClient from "@/api/axiosClient";

const teamStore = useTeamStore();
const playerStore = usePlayerStore();
const toast = useToastStore();

const isProcessing = ref(false);
const showAutoModal = ref(false);
const selectedPlayersForSplit = ref([]);

onMounted(async () => {
  await Promise.all([teamStore.fetchTeams(), playerStore.fetchPlayers()]);
});

// Helper tính điểm OVR (Overall)
const calculateOVR = (p) => {
  const stats = [p.pac, p.sho, p.pas, p.dri, p.def, p.phy].map(
    (v) => Number(v) || 50
  );
  return Math.round(stats.reduce((a, b) => a + b, 0) / 6);
};

// --- THUẬT TOÁN AUTO BALANCE ---
const autoSplitTeams = async () => {
  if (selectedPlayersForSplit.value.length < 2) {
    return toast.warning("Chọn ít nhất 2 cầu thủ để chia!");
  }

  isProcessing.value = true;

  // 1. Lấy danh sách team (t1, t2...)
  const teamIds = teamStore.teams.map((t) => t.id);

  // 2. Tạo 'xô' chứa players và tổng điểm
  let buckets = teamIds.map((id) => ({ id, players: [], totalOvr: 0 }));

  // 3. Sắp xếp cầu thủ từ GIỎI nhất -> YẾU nhất
  const sortedPlayers = [...selectedPlayersForSplit.value].sort(
    (a, b) => calculateOVR(b) - calculateOVR(a)
  );

  // 4. Chia bài: Người giỏi nhất vào đội đang yếu nhất
  sortedPlayers.forEach((p) => {
    buckets.sort((a, b) => a.totalOvr - b.totalOvr); // Sort đội yếu lên đầu
    buckets[0].players.push(p.id);
    buckets[0].totalOvr += calculateOVR(p);
  });

  // 5. Save về Server
  const payload = {};
  buckets.forEach((b) => {
    payload[b.id] = b.players;
  });

  try {
    await axiosClient.post("/teams/members", { teamSplits: payload });
    await teamStore.fetchTeams(); // Reload lại
    toast.success("Đã chia đội cân bằng! 🔥");
    showAutoModal.value = false;
  } catch (e) {
    toast.error("Lỗi khi lưu đội hình");
  } finally {
    isProcessing.value = false;
  }
};

const togglePlayerSelection = (player) => {
  const idx = selectedPlayersForSplit.value.findIndex(
    (p) => p.id === player.id
  );
  if (idx > -1) selectedPlayersForSplit.value.splice(idx, 1);
  else selectedPlayersForSplit.value.push(player);
};

const selectAll = () => {
  if (selectedPlayersForSplit.value.length === playerStore.players.length) {
    selectedPlayersForSplit.value = [];
  } else {
    selectedPlayersForSplit.value = [...playerStore.players];
  }
};

// UI Styling Helper
const getTeamStyles = (hex) => {
  const map = {
    "#10b981": {
      border: "border-emerald-500/50",
      bg: "from-emerald-500/20",
      text: "text-emerald-400",
    },
    "#ef4444": {
      border: "border-rose-500/50",
      bg: "from-rose-500/20",
      text: "text-rose-400",
    },
    "#f59e0b": {
      border: "border-amber-500/50",
      bg: "from-amber-500/20",
      text: "text-amber-400",
    },
    "#a855f7": {
      border: "border-purple-500/50",
      bg: "from-purple-500/20",
      text: "text-purple-400",
    },
  };
  return map[hex] || map["#10b981"];
};
</script>

<template>
  <div class="space-y-8 pb-20">
    <div
      class="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-white/10 p-8 shadow-2xl isolate"
    >
      <div
        class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl -z-10"
      ></div>

      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1
            class="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter"
          >
            TACTICAL
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
              >BOARD</span
            >
          </h1>
          <p class="text-slate-400 mt-2 font-medium">
            Quản lý đội hình & Chia team cân bằng
          </p>
        </div>

        <button
          @click="showAutoModal = true"
          class="group relative px-8 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"
          ></div>
          <span class="relative z-10 flex items-center gap-2">
            <span>⚖️</span> AUTO CHIA ĐỘI
          </span>
        </button>
      </div>
    </div>

    <div
      v-if="teamStore.loading"
      class="text-center py-20 text-white animate-pulse"
    >
      Đang tải chiến thuật...
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      <div
        v-for="team in teamStore.teams"
        :key="team.id"
        class="bg-slate-900/50 backdrop-blur-xl border-2 rounded-3xl overflow-hidden flex flex-col h-full transition-all hover:shadow-2xl"
        :class="getTeamStyles(team.color_hex).border"
      >
        <div class="p-6 relative">
          <div
            class="absolute inset-0 bg-gradient-to-b to-transparent opacity-30"
            :class="getTeamStyles(team.color_hex).bg"
          ></div>
          <h3
            class="text-2xl font-black text-white uppercase text-center drop-shadow-md"
          >
            {{ team.name }}
          </h3>
          <p
            class="text-center text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest"
          >
            Sức mạnh:
            <span class="text-yellow-400 text-base">{{
              team.totalStrength || 0
            }}</span>
          </p>
        </div>

        <div
          class="flex-1 p-4 pt-0 space-y-3 overflow-y-auto max-h-[500px] custom-scrollbar"
        >
          <div
            v-if="team.captain_id"
            class="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
          >
            <div class="relative">
              <img
                :src="team.captain_image || 'https://placehold.co/50'"
                class="w-10 h-10 rounded-full object-cover border border-yellow-400"
              />
              <span class="absolute -top-2 -right-1 text-xs">👑</span>
            </div>
            <div>
              <p class="font-bold text-yellow-400 text-sm">
                {{ team.captain_name }}
              </p>
              <p class="text-[10px] text-yellow-200/70 uppercase">Đội Trưởng</p>
            </div>
          </div>

          <div
            v-for="m in team.members"
            :key="m.id"
            v-show="m.id !== team.captain_id"
            class="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group"
            @click="$router.push(`/players/${m.id}`)"
          >
            <img
              :src="m.imageUrl || 'https://placehold.co/50'"
              class="w-8 h-8 rounded-full object-cover border border-slate-600 group-hover:border-white"
            />
            <div class="flex-1 min-w-0">
              <div class="flex justify-between">
                <p
                  class="font-bold text-slate-300 text-sm truncate group-hover:text-white"
                >
                  {{ m.name }}
                </p>
                <span
                  class="text-xs font-black text-slate-500 group-hover:text-white"
                  >{{ calculateOVR(m) }}</span
                >
              </div>
              <p class="text-[10px] text-slate-500 uppercase">
                {{ m.position }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showAutoModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
        @click="showAutoModal = false"
      ></div>
      <div
        class="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 shadow-2xl animate-scale-up"
      >
        <div
          class="p-6 border-b border-white/10 flex justify-between items-center bg-white/5"
        >
          <h3 class="text-2xl font-black text-white">CHỌN CẦU THỦ RA SÂN</h3>
          <button
            @click="selectAll"
            class="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase"
          >
            {{
              selectedPlayersForSplit.length === playerStore.players.length
                ? "Bỏ chọn tất cả"
                : "Chọn tất cả"
            }}
          </button>
        </div>

        <div
          class="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 custom-scrollbar"
        >
          <div
            v-for="player in playerStore.players"
            :key="player.id"
            @click="togglePlayerSelection(player)"
            class="relative p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 group hover:scale-105"
            :class="
              selectedPlayersForSplit.some((p) => p.id === player.id)
                ? 'bg-blue-600/20 border-blue-500'
                : 'bg-slate-800 border-transparent hover:border-slate-600'
            "
          >
            <img
              :src="player.imageUrl || 'https://placehold.co/100'"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div class="text-center">
              <p class="font-bold text-white text-xs truncate w-24">
                {{ player.name }}
              </p>
              <p class="text-[10px] text-slate-400 font-mono">
                OVR:
                <span class="text-green-400 font-bold">{{
                  calculateOVR(player)
                }}</span>
              </p>
            </div>

            <div
              v-if="selectedPlayersForSplit.some((p) => p.id === player.id)"
              class="absolute top-2 right-2 text-blue-400 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg"
            >
              ✓
            </div>
          </div>
        </div>

        <div
          class="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-4"
        >
          <button
            @click="showAutoModal = false"
            class="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
          >
            Hủy
          </button>
          <button
            @click="autoSplitTeams"
            :disabled="isProcessing"
            class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            {{ isProcessing ? "Đang tính toán..." : "🚀 CHIA ĐỘI NGAY" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
.animate-scale-up {
  animation: scaleUp 0.3s ease-out;
}
@keyframes scaleUp {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
