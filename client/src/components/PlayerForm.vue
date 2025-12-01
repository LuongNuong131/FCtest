<script setup>
import { ref, reactive, onMounted } from "vue";
import { usePlayerStore } from "@/stores/playerStore";
import { useRouter, useRoute } from "vue-router";
import { useToastStore } from "@/stores/toastStore";

const props = defineProps({ isEditing: Boolean });
const playerStore = usePlayerStore();
const router = useRouter();
const route = useRoute();
const toast = useToastStore();

const loading = ref(false);
const formData = reactive({
  name: "",
  phone: "",
  dob: "",
  height_cm: "",
  weight_kg: "",
  position: "Defender",
  jerseyNumber: "",
  imageUrl: "",
  dominantFoot: "Right",
  // NEW: 6 chỉ số
  pac: 50,
  sho: 50,
  pas: 50,
  dri: 50,
  def: 50,
  phy: 50,
});

onMounted(async () => {
  if (props.isEditing) {
    loading.value = true;
    try {
      const id = route.params.id;
      const p = await playerStore.getPlayerById(id);

      Object.assign(formData, {
        ...p,
        dob: p.dob ? p.dob.split("T")[0] : "",
        dominantFoot: p.dominantFoot || "Right",
        pac: p.pac || 50,
        sho: p.sho || 50,
        pas: p.pas || 50,
        dri: p.dri || 50,
        def: p.def || 50,
        phy: p.phy || 50,
      });
    } catch (e) {
      toast.error("Không tải được dữ liệu cầu thủ!");
      router.push("/players");
    } finally {
      loading.value = false;
    }
  }
});

const handleSubmit = async () => {
  try {
    const dataToSend = {
      ...formData,
      pac: parseInt(formData.pac),
      sho: parseInt(formData.sho),
      pas: parseInt(formData.pas),
      dri: parseInt(formData.dri),
      def: parseInt(formData.def),
      phy: parseInt(formData.phy),
      jerseyNumber: parseInt(formData.jerseyNumber),
    };

    if (props.isEditing) {
      await playerStore.updatePlayer(route.params.id, dataToSend);
      toast.success("Cập nhật thành công! 📝");
    } else {
      await playerStore.createPlayer(dataToSend);
      toast.success("Thêm cầu thủ mới thành công! ⚽");
    }
    router.push("/players");
  } catch (e) {
    console.error(e);
    toast.error("Lỗi: " + (e.response?.data?.message || e.message));
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto pt-10 pb-20 px-4">
    <div
      class="bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-indigo-500/30"
    >
      <h2
        class="text-3xl font-black text-white mb-8 flex items-center gap-3 border-b border-white/10 pb-4"
      >
        <span class="text-4xl">{{ isEditing ? "✏️" : "🆕" }}</span>
        {{ isEditing ? "Cập Nhật Hồ Sơ" : "Chiêu Mộ Tân Binh" }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <h3 class="text-xl font-bold text-indigo-400 mb-4">Thông Tin Cơ Bản</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="form-label">Họ và Tên *</label>
            <input
              v-model="formData.name"
              class="form-input"
              required
              placeholder="Nhập tên cầu thủ..."
            />
          </div>

          <div>
            <label class="form-label">Vị Trí</label>
            <select v-model="formData.position" class="form-input">
              <option value="Forward">Tiền đạo (Forward)</option>
              <option value="Midfielder">Tiền vệ (Midfielder)</option>
              <option value="Defender">Hậu vệ (Defender)</option>
              <option value="Goalkeeper">Thủ môn (Goalkeeper)</option>
            </select>
          </div>
          <div>
            <label class="form-label">Chân Thuận</label>
            <select v-model="formData.dominantFoot" class="form-input">
              <option value="Right">Chân Phải</option>
              <option value="Left">Chân Trái</option>
              <option value="Both">Hai chân</option>
            </select>
          </div>

          <div>
            <label class="form-label">Số Áo</label>
            <input
              v-model="formData.jerseyNumber"
              type="number"
              class="form-input"
              placeholder="VD: 10"
            />
          </div>
          <div>
            <label class="form-label">Ngày Sinh</label>
            <input v-model="formData.dob" type="date" class="form-input" />
          </div>

          <div>
            <label class="form-label">Chiều cao (cm)</label>
            <input
              v-model="formData.height_cm"
              type="number"
              class="form-input"
            />
          </div>
          <div>
            <label class="form-label">Cân nặng (kg)</label>
            <input
              v-model="formData.weight_kg"
              type="number"
              class="form-input"
            />
          </div>

          <div>
            <label class="form-label">Số Điện Thoại</label>
            <input
              v-model="formData.phone"
              type="text"
              class="form-input"
              placeholder="09..."
            />
          </div>
          <div>
            <label class="form-label">Link Ảnh Avatar (URL)</label>
            <input
              v-model="formData.imageUrl"
              class="form-input"
              placeholder="https://..."
            />
          </div>
        </div>

        <h3
          class="text-xl font-bold text-green-400 pt-8 mb-4 border-t border-gray-800"
        >
          Chỉ Số Sức Mạnh (FIFA Stats)
        </h3>
        <p class="text-slate-500 text-sm italic mb-4">Giá trị từ 1-100</p>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div class="stat-group">
            <label class="form-label">Tốc Độ (PAC)</label>
            <input
              v-model="formData.pac"
              type="number"
              min="1"
              max="100"
              class="form-input text-lg font-bold"
            />
          </div>
          <div class="stat-group">
            <label class="form-label">Sút (SHO)</label>
            <input
              v-model="formData.sho"
              type="number"
              min="1"
              max="100"
              class="form-input text-lg font-bold"
            />
          </div>
          <div class="stat-group">
            <label class="form-label">Chuyền (PAS)</label>
            <input
              v-model="formData.pas"
              type="number"
              min="1"
              max="100"
              class="form-input text-lg font-bold"
            />
          </div>
          <div class="stat-group">
            <label class="form-label">Rê Bóng (DRI)</label>
            <input
              v-model="formData.dri"
              type="number"
              min="1"
              max="100"
              class="form-input text-lg font-bold"
            />
          </div>
          <div class="stat-group">
            <label class="form-label">Phòng Ngự (DEF)</label>
            <input
              v-model="formData.def"
              type="number"
              min="1"
              max="100"
              class="form-input text-lg font-bold"
            />
          </div>
          <div class="stat-group">
            <label class="form-label">Thể Lực (PHY)</label>
            <input
              v-model="formData.phy"
              type="number"
              min="1"
              max="100"
              class="form-input text-lg font-bold"
            />
          </div>
        </div>

        <div class="flex justify-end gap-4 pt-6 border-t border-gray-800">
          <button type="button" @click="router.back()" class="btn-secondary">
            Hủy bỏ
          </button>
          <button type="submit" class="btn-primary">
            {{ isEditing ? "Lưu Thay Đổi" : "Thêm Cầu Thủ" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-label {
  @apply block text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wider;
}
.form-input {
  @apply w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all;
}
.btn-primary {
  @apply px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all;
}
.btn-secondary {
  @apply px-6 py-3 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-600 transition-colors;
}
.stat-group {
  @apply flex flex-col;
}
</style>
