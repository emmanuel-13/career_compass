<script setup>
import { Motion } from "@motionone/vue"
import discover from "../data/lotties/discover.json";
import { Vue3Lottie } from "vue3-lottie";

const animate = {
    discover
}

defineProps({
    careers: Array,
    show: Boolean
});

const emit = defineEmits([
    "close"
]);
</script>

<template>
    <div
        v-if="show"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
    >

        <Motion
            :initial="{ opacity: 0, scale: 0.8, y: 100 }"
            :animate="{ opacity: 1, scale: 1, y: 0 }"
            :transition="{ duration: 0.5 }"
            class="bg-white w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl"
        >

            <!-- Header -->
            <div class="p-8 border-b">
                <div class="flex items-center justify-between mb-4">

                    <h1 class="text-3xl font-bold">
                        Recommended Careers
                    </h1>

                    <button
                        @click="$emit('close')"
                        class="text-gray-500 hover:text-black text-2xl"
                    >
                        ×
                    </button>

                </div>

                <div class="mb-8">
                    <div class="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full mb-6 border border-indigo-100">
                        <Vue3Lottie
                            :animation-data="animate.discover"
                            :height="24"
                            :width="24"
                        />
                        <span class="text-sm font-medium text-indigo-900"> Career Assessment </span>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Discover Your Path</h1>
                    <p class="text-gray-600">Answer honestly to get the most accurate career recommendations</p>
                </div>


            </div>

            <!-- Content -->
            <div class="grid lg:grid-cols-3 gap-6 p-8">

                <Motion
                    v-for="career in careers"
                    :key="career.id"
                    :initial="{ opacity: 0, y: 80 }"
                    :animate="{ opacity: 1, y: 0 }"
                    :transition="{ duration: 0.4 }"
                    class="bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all"
                >

                    <!-- Image -->
                    <div class="h-64 overflow-hidden">

                        <img
                            :src="career.image"
                            class="w-full h-full object-cover hover:scale-110 transition-all duration-500"
                        />

                    </div>

                    <!-- Body -->
                    <div class="p-6">

                        <h2 class="text-2xl font-bold mb-3">
                            {{ career.title }}
                        </h2>

                        <p class="text-gray-600 mb-6">
                            {{ career.description }}
                        </p>

                        <div class="flex flex-wrap gap-2 mb-6">

                            <span
                                v-for="skill in career.skills"
                                :key="skill"
                                class="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm"
                            >
                                {{ skill }}
                            </span>

                        </div>

                        <router-link
                            :to="`/explore/${career.slug}`"
                            class="w-full inline-flex justify-center items-center h-12 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all"
                        >
                            Learn More
                        </router-link>

                    </div>

                </Motion>

            </div>

        </Motion>

    </div>

</template>