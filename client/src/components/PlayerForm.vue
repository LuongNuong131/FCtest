<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useRouter, useRoute } from "vue-router";
import { useToastStore } from "@/stores/toastStore";
import axiosClient from "@/api/axiosClient";
import { DEFAULT_TRAITS } from "@/data/defaultTraits";

const props = defineProps({ isEditing: Boolean });
const playerStore = usePlayerStore();
const router = useRouter();
const route = useRoute();
const toast = useToastStore();

const loading = ref(false);
const customTraits = ref([]);

// Form dữ liệu đầy đủ
const formData = reactive({
  name: "",
  phone: "",
  dob: "",
  height_cm: 170,
  weight_kg: 60,
  position: "Midfielder",
  jerseyNumber: 0,
  imageUrl: "",
  dominantFoot: "Right",
  // Stats
  pac: 60,
  sho: 60,
  pas: 60,
  dri: 60,
  def: 60,
  phy: 60,
  traits: [],
});

// Danh sách chỉ số với tên tiếng Việt
const STAT_LABELS = {
  pac: "Tốc độ (Pace)",
  sho: "Sút (Shooting)",
  pas: "Chuyền (Passing)",
  dri: "Rê bóng (Dribbling)",
  def: "Phòng ngự (Defending)",
  phy: "Thể lực (Physical)",
};

// Load Custom Traits từ DB
const fetchCustomTraits = async () => {
  try {
    const res = await axiosClient.get("/traits");
    // Map để đảm bảo có trường 'image'
    customTraits.value = res.data.map((t) => ({
      ...t,
      image: t.image_url || t.image, // Fallback
    }));
  } catch (e) {
    console.error(e);
  }
};

onMounted(async () => {
  await fetchCustomTraits();

  if (props.isEditing) {
    loading.value = true;
    try {
      const p = await playerStore.getPlayerById(route.params.id);

      // Parse Traits an toàn
      let parsedTraits = [];
      try {
        parsedTraits =
          typeof p.traits_json === "string"
            ? JSON.parse(p.traits_json)
            : p.traits_json || [];
      } catch (e) {
        parsedTraits = [];
      }

      // Fill data vào form
      Object.assign(formData, {
        name: p.name,
        phone: p.phone || "",
        dob: p.dob ? p.dob.split("T")[0] : "",
        height_cm: Number(p.height_cm) || 0,
        weight_kg: Number(p.weight_kg) || 0,
        position: p.position,
        jerseyNumber: Number(p.jerseyNumber || p.jersey_number) || 0,
        imageUrl: p.imageUrl || p.image_url || "",
        dominantFoot: p.dominantFoot || p.dominant_foot || "Right",
        pac: Number(p.pac),
        sho: Number(p.sho),
        pas: Number(p.pas),
        dri: Number(p.dri),
        def: Number(p.def),
        phy: Number(p.phy),
        traits: parsedTraits,
      });
    } catch (e) {
      console.error(e);
      toast.error("Lỗi tải dữ liệu cầu thủ!");
    } finally {
      loading.value = false;
    }
  }
});

// Logic chọn Trait (1 Vàng, Nhiều Bạc)
const toggleTrait = (trait, level) => {
  const existingIdx = formData.traits.findIndex((t) => t.id === trait.id);

  // Nếu đang chọn đúng level đó -> Bỏ chọn (Xóa)
  if (existingIdx > -1 && formData.traits[existingIdx].level === level) {
    formData.traits.splice(existingIdx, 1);
    return;
  }

  // Nếu chọn Gold -> Xóa Gold cũ đi (chỉ cho phép 1 Gold)
  if (level === "gold") {
    const oldGoldIdx = formData.traits.findIndex((t) => t.level === "gold");
    if (oldGoldIdx > -1) formData.traits.splice(oldGoldIdx, 1);
  }

  // Xóa trait cũ nếu có (để update level mới hoặc xóa level cũ)
  if (existingIdx > -1) formData.traits.splice(existingIdx, 1);

  // Thêm trait mới vào danh sách
  formData.traits.push({
    id: trait.id,
    name: trait.name,
    image: trait.image, // Lưu link ảnh để hiển thị
    level: level,
  });
};

const isTraitSelected = (id, level) => {
  return formData.traits.some((t) => t.id === id && t.level === level);
};

const handleSubmit = async () => {
  if (!formData.name) return toast.error("Vui lòng nhập tên cầu thủ!");

  loading.value = true;

  // Chuẩn hóa dữ liệu số
  const payload = {
    ...formData,
    jerseyNumber: Number(formData.jerseyNumber),
    height_cm: Number(formData.height_cm),
    weight_kg: Number(formData.weight_kg),
    pac: Number(formData.pac),
    sho: Number(formData.sho),
    pas: Number(formData.pas),
    dri: Number(formData.dri),
    def: Number(formData.def),
    phy: Number(formData.phy),
  };

  try {
    if (props.isEditing) {
      await playerStore.updatePlayer(route.params.id, payload);
      toast.success("Cập nhật hồ sơ thành công! 🎉");
    } else {
      await playerStore.createPlayer(payload);
      toast.success("Thêm cầu thủ mới thành công! ⚽");
    }
    router.push("/players");
  } catch (e) {
    toast.error("Lỗi: " + (e.response?.data?.error || e.message));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-6 pb-24">
    <div
      class="bg-slate-900 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden"
    >
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"
      ></div>

      <div
        class="relative z-10 flex justify-between items-center mb-8 border-b border-white/10 pb-6"
      >
        <h2 class="text-3xl font-black text-white flex items-center gap-3">
          <span class="text-4xl">{{ isEditing ? "✏️" : "🆕" }}</span>
          {{ isEditing ? "Chỉnh Sửa Hồ Sơ" : "Thêm Cầu Thủ" }}
        </h2>
        <button
          @click="router.back()"
          class="text-slate-400 hover:text-white font-bold transition-colors"
        >
          ✕ Hủy bỏ
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-10">
        <section>
          <h3
            class="text-xl font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2"
          >
            <span>👤</span> Thông Tin Cá Nhân
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="col-span-1 md:col-span-2">
              <label class="lbl"
                >Họ và Tên <span class="text-red-500">*</span></label
              >
              <input
                v-model="formData.name"
                class="inp font-bold text-lg"
                placeholder="VD: Nguyễn Văn A"
                required
              />
            </div>

            <div>
              <label class="lbl">Số Áo Thi Đấu</label>
              <input
                type="number"
                v-model.number="formData.jerseyNumber"
                class="inp"
                placeholder="VD: 10"
              />
            </div>

            <div>
              <label class="lbl">Vị Trí Sở Trường</label>
              <select v-model="formData.position" class="inp cursor-pointer">
                <option value="Forward">Tiền Đạo (Forward)</option>
                <option value="Midfielder">Tiền Vệ (Midfielder)</option>
                <option value="Defender">Hậu Vệ (Defender)</option>
                <option value="Goalkeeper">Thủ Môn (GK)</option>
              </select>
            </div>

            <div>
              <label class="lbl">Chân Thuận</label>
              <select
                v-model="formData.dominantFoot"
                class="inp cursor-pointer"
              >
                <option value="Right">Chân Phải</option>
                <option value="Left">Chân Trái</option>
                <option value="Both">Hai Chân (5-5)</option>
              </select>
            </div>

            <div>
              <label class="lbl">Ngày Sinh</label>
              <input type="date" v-model="formData.dob" class="inp" />
            </div>

            <div>
              <label class="lbl">Số Điện Thoại</label>
              <input
                v-model="formData.phone"
                class="inp"
                placeholder="09xxxx..."
              />
            </div>

            <div>
              <label class="lbl">Chiều Cao (cm)</label>
              <input
                type="number"
                v-model.number="formData.height_cm"
                class="inp"
                placeholder="175"
              />
            </div>

            <div>
              <label class="lbl">Cân Nặng (kg)</label>
              <input
                type="number"
                v-model.number="formData.weight_kg"
                class="inp"
                placeholder="70"
              />
            </div>

            <div class="col-span-1 md:col-span-3">
              <label class="lbl">Link Ảnh Đại Diện (URL)</label>
              <input
                v-model="formData.imageUrl"
                class="inp"
                placeholder="https://..."
              />
              <p class="text-xs text-slate-500 mt-1 italic">
                Nên dùng link ảnh vuông để hiển thị đẹp nhất.
              </p>
            </div>
          </div>
        </section>

        <hr class="border-white/10" />

        <section>
          <h3
            class="text-xl font-bold text-green-400 mb-4 uppercase tracking-wider flex items-center gap-2"
          >
            <span>📊</span> Chỉ Số Kỹ Năng (1 - 99)
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div
              v-for="(label, key) in STAT_LABELS"
              :key="key"
              class="bg-slate-800 p-3 rounded-xl border border-white/5 hover:border-green-500/50 transition-all"
            >
              <label
                class="block text-center text-[10px] font-bold text-slate-400 uppercase mb-2"
                >{{ label }}</label
              >
              <div class="relative">
                <input
                  type="number"
                  v-model.number="formData[key]"
                  min="1"
                  max="99"
                  class="w-full text-center font-black text-2xl bg-transparent text-white focus:outline-none border-b-2 border-slate-600 focus:border-green-500 transition-colors pb-1"
                />
              </div>
            </div>
          </div>
        </section>

        <hr class="border-white/10" />

        <section>
          <div class="flex justify-between items-end mb-4">
            <h3
              class="text-xl font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2"
            >
              <span>💎</span> PlayStyles (Chỉ Số Ẩn)
            </h3>
            <span
              class="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-white/10"
            >
              Đã chọn:
              <b class="text-yellow-400"
                >{{
                  formData.traits.filter((t) => t.level === "gold").length
                }}
                Vàng</b
              >
              +
              <b class="text-slate-200"
                >{{
                  formData.traits.filter((t) => t.level === "silver").length
                }}
                Bạc</b
              >
            </span>
          </div>

          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scroll bg-slate-800/30 p-4 rounded-2xl border border-white/5"
          >
            <div
              v-for="t in [...DEFAULT_TRAITS, ...customTraits]"
              :key="t.id"
              class="bg-slate-800 p-3 rounded-xl border border-white/5 flex flex-col items-center gap-2 group hover:bg-slate-750 transition-all relative overflow-hidden"
            >
              <div
                v-if="isTraitSelected(t.id, 'gold')"
                class="absolute inset-0 bg-yellow-500/10 pointer-events-none"
              ></div>
              <div
                v-if="isTraitSelected(t.id, 'silver')"
                class="absolute inset-0 bg-slate-400/10 pointer-events-none"
              ></div>

              <img
                :src="t.image || t.image_url"
                class="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform"
              />

              <div class="w-full text-center">
                <span
                  class="block text-[11px] font-bold text-slate-200 truncate"
                  >{{ t.name }}</span
                >
              </div>

              <div class="flex gap-1 w-full mt-1">
                <button
                  type="button"
                  @click="toggleTrait(t, 'silver')"
                  class="flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all"
                  :class="
                    isTraitSelected(t.id, 'silver')
                      ? 'bg-slate-200 text-slate-900 border-slate-200 shadow-md transform scale-105'
                      : 'bg-transparent border-slate-600 text-slate-500 hover:text-slate-300 hover:border-slate-500'
                  "
                >
                  Bạc
                </button>
                <button
                  type="button"
                  @click="toggleTrait(t, 'gold')"
                  class="flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all"
                  :class="
                    isTraitSelected(t.id, 'gold')
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-yellow-500 shadow-glow transform scale-105'
                      : 'bg-transparent border-slate-600 text-slate-500 hover:text-yellow-400 hover:border-yellow-500/50'
                  "
                >
                  Vàng
                </button>
              </div>
            </div>
          </div>
        </section>

        <div class="sticky bottom-4 z-20 pt-4">
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-blue-500/30 transition-all transform active:scale-[0.98] flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span
              v-if="loading"
              class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></span>
            <span>{{ isEditing ? "LƯU THAY ĐỔI" : "TẠO CẦU THỦ MỚI" }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.lbl {
  @apply block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide;
}
.inp {
  @apply w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-600;
}
.shadow-glow {
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
}
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
