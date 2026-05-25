<template>
    <div>
    <div class="rounded-3xl bg-white/80 backdrop-blur-lg shadow-2xl p-8 border border-indigo-100 md:p-12">
        <div class="space-y-6">
            <!-- Top Icon -->
            <div class="flex justify-center">
                <div
                class="rounded-full bg-linear-to-br from-indigo-600 via-purple-600 p-6"
                >
                <Vue3Lottie
                    :animation-data="animate[animation.data.intro.animation]"
                    :height="40"
                    :width="40"
                />
                </div>
            </div>

            <!-- Heading -->
            <div class="text-center mb-8">
                <h2 class="md:text-3xl font-bold text-gray-900 mb-2">
                    {{ animation.data.next.title }}
                </h2>

                <p class="text-gray-600">
                    {{ animation.data.next.description }}
                </p>
            </div>

            <form class="space-y-6" @submit.prevent="submitForm">
                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm leading-none font-none">Enter Your Name?</label>
                    <input type="text" v-model.trim="formData.name" class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm 
                    focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 
                    aria-invalid:border-destructive bg-white/50 backdrop-blur border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" placeholder="Enter your Name" />
                    <p v-if="errors.name" class="text-red-500 text-sm">
                        {{ errors.name }}
                    </p>
                </div>

                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm leading-none font-none">How old are you?</label>
                    <input type="number" v-model.number="formData.age" class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] 
                    aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-white/50 backdrop-blur border-gray-300
                     focus:border-indigo-500 focus:ring-indigo-500" placeholder="Enter your age" />
                     <p v-if="errors.age" class="text-red-500 text-sm">
                        {{ errors.age }}
                    </p>
                </div>

                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm leading-none font-none">Where are you from?</label>
                    <select name="country" id="country" v-model="formData.country" class="file:text-foreground placeholder:text-muted-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="us">United States</option>
                        <option value="ng">Nigeria</option>
                        <option value="uk">United Kingdom</option>
                    </select>
                    <span class="text-gray-900">
                        We'll show career requirements and salaries specific to your country
                    </span>
                </div>

                <button type="submit" class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 
                focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-9 px-4 has-[>svg]:px-3 w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
                    {{ isLoading ? 'Loading...' : 'Start Exploring Career' }}
                </button>
            </form>
        </div>
    </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Vue3Lottie } from 'vue3-lottie';
import discover from "../data/lotties/discover.json";


const animate = {
    discover
}

const formData = ref({
    name: '',
    age: '',
    country: 'us'
});

const errors = ref({
  name: '',
  age: ''
});

const isLoading = ref(false);

const props = defineProps({
    animation: {
        type: Object,
        required: true
    }
})

const emits = defineEmits(['formSubmitted']);

const submitForm = () => {
    // Reset errors
    errors.value = {
        name: '',
        age: '',
    };

    let hasError = false;

    if (!formData.value.name) {
        errors.value.name = "Please enter your name";
        hasError = true;
    }

    if (!formData.value.age) {
        errors.value.age = "Please enter a valid age between 10 and 100";
        hasError = true;
    } else if (isNaN(formData.value.age)) {
        errors.value.age = "Age must be a number";
        hasError = true;
    }

    // if (!formData.value.country) {
    //     errors.value.country = "Please select a country";
    //     hasError = true;
    // }

    isLoading.value = true;
    console.log(formData.value);

    if (hasError) {
        isLoading.value = false;
        return;
    }

    // If no error → submit
    emits('formSubmitted', formData.value);
};

</script>

<style scoped>

</style>