<template>
    <div>
        <div class="rounded-3xl bg-white/80 backdrop-blur-lg shadow-2xl p-8 border border-indigo-100 md:p-12">
            <div class="text-center space-y-6">
                <!-- Top Icon -->
                <div class="flex justify-center">
                    <div
                    class="rounded-full bg-linear-to-br from-indigo-600 via-purple-600 p-6"
                    >
                    <Vue3Lottie
                        :animation-data="animate[animation.data.intro.animation]"
                        :height="100"
                        :width="100"
                    />
                </div>
                </div>

                <!-- Heading -->
                <div class="space-y-3">
                    <h2 class="md:text-5xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text ">
                        {{ animation.data.intro.title }}
                    </h2>

                    <p class="text-gray-600 text-xl">
                        {{ animation.data.intro.description }}
                    </p>
                </div>


                <!-- Responsive Cards -->
                <div class="grid md:grid-cols-3 gap-6 py-8">

                    <!-- Card 1 -->
                    <div :class="[data.background, 'rounded-2xl', 'border', 'border-blue-200', 'p-6']"  v-for="data in animation.data.steps" :key="data.id">
                        <div
                        :class="[data.color, 'w-12', 'h-12', 'rounded-full', 'mx-auto', 'flex', 'items-center', 'justify-center', 'mb-4']"
                        >
                        <Vue3Lottie
                            :animation-data="animate[data.animation]"
                            :height="35"
                            :width="35"
                        />
                        </div>

                        <h3 class="font-semibold text-gray-900 mb-2">
                            {{ data.title }}
                        </h3>

                        <p class="text-gray-600 text-sm">
                            {{ data.description }}
                        </p>
                    </div>

                </div>

                <button @click="toggleButton" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl transition duration-300">
                    Get Started
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import question from "../data/lotties/question.json";
import job from "../data/lotties/job.json";
import path from "../data/lotties/path.json";
import discover from "../data/lotties/discover.json";
import { defineProps } from 'vue';
import { Vue3Lottie } from "vue3-lottie";  

const animate = {
    question,
    discover,
    job,
    path
}

const props = defineProps({
    animation: {
        type: Object,
        required: true
    },

})

const emit = defineEmits(['toggle']);

const toggleButton = () => {
    emit('toggle');
}

</script>

<style scoped>

</style>