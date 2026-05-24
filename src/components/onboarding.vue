<template>
  <div class="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 flex items-center justify-center">
    
    <!-- Main Card -->
    <div class="w-full max-w-2xl">

    <onboaringOne v-if="nextStep" :animation="animation" @toggle="toggleButton" />
    <onboardingTwo v-else :animation="animation" @formSubmitted="handleFormSubmit" />

    </div>
  </div>
</template>

<script setup>  
import data from "../data/local_database/onboarding.json";
import { ref } from "vue";
import onboaringOne from "./onboaringOne.vue";
import onboardingTwo from "./onboardingTwo.vue";
import { useUserStore } from "@/stores/users";
import { useRouter } from "vue-router";

const animation = {
  data,
  store: useUserStore(),
  loading: ref(false),
  router: useRouter(),
};

const nextStep = ref(
  localStorage.getItem("onboardingStep") !== "completed"
);

const toggleButton = () => {
  nextStep.value = false;
  localStorage.setItem("onboardingStep", "completed");
};


const handleFormSubmit = async (formData) => {
  try {
    animation.loading.value = true;

    await animation.store.addUser(formData); // WAIT for user creation

    animation.router.push({ name: "home" });

  } catch (error) {
    console.log("Error submitting form:", error);
  } finally {
    animation.loading.value = false;
  }
};

</script>

<style scoped>
div {
  transition: all 0.3s ease-in-out;
}
</style>