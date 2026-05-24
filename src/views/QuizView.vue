<template>
    <div>
        <section class="pt-24 pb-20 px-6 lg:px-8">
            <div class="max-w-6xl mx-auto">
                <div class="mb-12">
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

                <Quiz :question="quiz_questions" />
                
            </div>
        </section>
    </div>
</template>

<script setup>

import { Vue3Lottie } from "vue3-lottie";

// built in vuejs
import { onMounted, computed } from "vue";
import { RouterLink } from "vue-router";
import Quiz from "@/components/Quiz.vue";

// lottie json files
import discover from "../data/lotties/discover.json";
import question from "../data/lotties/question.json";
import normal from "../data/lotties/normal.json";
import path from "../data/lotties/path.json";
import job from "../data/lotties/job.json";
import ripple from "../data/lotties/ripple.json";

// store.js
import { useUserStore } from "@/stores/users";

// local json
import steps from "../data/local_database/home.json";
import  steps_outcome from "../data/local_database/home.json";
import  whyUs from "../data/local_database/home.json";
import steps2 from "../data/local_database/home.json";
import Question from "../data/local_database/quiz.json"

const quiz_questions = Question.questions

const animate = {
    discover, question, normal, steps, ripple,
    steps_outcome, path, job, whyUs, steps2, quiz_questions 
}

const user = useUserStore();

onMounted(async () => {
    await user.fetchCurrentUser();
});

</script>

<style scoped>

</style>