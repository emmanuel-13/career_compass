<template>
    <div>
        <section class="pt-24 pb-20 px-6 lg:px-8 bg-gradient-to-b from-gray-90 to-white">
            <div class="max-w-6xl mx-auto">
                <div class="grid lg:grid-cols-2 gap-2 items-center">
                    <div class="max-w-l">
                        <div class="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full mb-6 border border-indigo-100">
                            <Vue3Lottie
                                :animation-data="animate.discover"
                                :height="24"
                                :width="24"
                            />
                            <span class="text-sm font-medium text-indigo-900"> Your Career Journey </span>
                        </div>

                        <h1 class="text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 tracking-tight">
                            Welcome {{ user.currentUser.name }}! <br>
                            <span class="text-indigo-600">Start Exploring</span>
                        </h1>
                        <p class="leading-relexed text-xl text-grey-600 mb-8">
                            Take a comprehensive career assessment, explore personalized matches, and develop the skills you need to succeed in your future career.
                        </p>

                        <div class="flex flex-wrap gap-4">
                            <router-link to="/quiz">
                                <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:pointer-events-none 
                                disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 
                                outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 
                                dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive rounded-md has-[>svg]:px-4 bg-indigo-600
                              hover:bg-indigo-700 text-white px-8 h-12 text-base font-semibold shadow-sm hover:shadow transition-all">
                                    Start Career Assessment
                                    <Vue3Lottie
                                    :animation-data="animate.question"
                                    :height="24"
                                    :width="24"
                                />
                                </button>
                                
                            </router-link>

                            <router-link to="/explore">
                                <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all disabled:pointer-events-none 
                                disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none 
                                focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 
                                aria-invalid:border-destructive border bg-background hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 
                                rounded-md has-[>svg]:px-4 border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-8 h-12 text-base font-semibold">
                                <Vue3Lottie
                                    :animation-data="animate.discover"
                                    :height="24"
                                    :width="24"
                                />
                                    Explore Careers
                                </button>
                                
                            </router-link>
                        </div>
                        <div class="flex gap-10 mt-12 pt-8 border-grey-200">
                            <div>
                                <div class="text-3xl font-bold text-grey-900">
                                    15
                                </div>
                                <div class="text-sm mt-1 text-grey-600">
                                    Question Quiz
                                </div>
                            </div>
                            <div>
                                <div class="text-3xl font-bold text-grey-900">
                                    19
                                </div>
                                <div class="text-sm mt-1 text-grey-600">
                                    Career Path
                                </div>
                            </div>

                            <div>
                                <div class="text-3xl font-bold text-grey-900">
                                    5
                                </div>
                                <div class="text-sm mt-1 text-grey-600">
                                    Countries
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="relative lg:pl-12">
                        <div class="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                            <img src="https://images.unsplash.com/photo-1605627079912-97c3810a11a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHN0dWRlbnRzJTIwbGVhcm5pbmclMjB0b2dldGhlciUyMGNvbG9yZnVsfGVufDF8fHx8MTc3MjkxNTgwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Students Exploring Careers">
                        </div>

                        <div class="absolute -bottom-4 -left-4 bg-white px-6 py-3 rounded-xl shadow-lg border border-gray-200">
                            <div class="flex items-center gap-2">
                                <Vue3Lottie 
                                    :animation-data="animate.discover"
                                    :height="24"
                                    :width="24"
                                />
                                <span class="font-semibold text-gray-900"> Free to use </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- <section class="pt-24 pb-20 px-6 lg:px-8 bg-gradient-to-b from-gray-90 to-white"> -->
        <section class="py-20 px-6 lg:px-8 bg-white">
            <div class="max-w-6xl mx-auto" v-if="animate.steps.howItWorks">
                <div class="text-center mb-16">
                    <h2 class="text-4xl font-bold mb-4 text-gray-900 tracking-tight">
                        {{ animate.steps.howItWorks.title }}
                    </h2>
                    <p class="text-lg text-gray-600 max-w-2xl mx-auto"> {{ animate.steps.howItWorks.content }} </p>
                </div>
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow" v-for="(outcome, index) in animate.steps_outcome.steps" :key="outcome.id">
                        <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                            <Vue3Lottie
                            :animation-data="animate[outcome.icon]"
                            :height="50"
                            :width="50"
                        />
                        </div>

                        <div class="flex items-center gap-3 mb-4">
                            <span class="text-sm font-bold text-indigo-600"> Step {{ index + 1 }} </span>
                        </div>
                        <h3 class="text-2xl font-bold mb-3 text-gray-900">
                            {{outcome.title}}
                        </h3>
                        <p class="text-gray-600 leading-relaxed">
                            {{outcome.content}}
                        </p>
                    </div>
                </div>

                <div class="text-center mt-12">
                    <router-link to="/quiz">
                        <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none
                            [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 
                            dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive rounded-md has-[>svg]:px-4 bg-indigo-600 hover:bg-indigo-700
                            text-white px-8 h-12 text-base font-semibold shadow-sm hover:shadow transition-all">
                                Get Started Now
                                <Vue3Lottie
                                    :animation-data="animate.normal"
                                    :height="30"
                                    :width="30"
                                />
                            </button>
                    </router-link>
                    
                </div>
            </div>
        </section>
        <!-- </section> -->

        <section class="py-20 px-6 lg:px-8 bg-gray-50">
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-16">
                    <h2 class="text-4xl font-bold mb-4 text-gray-900 tracking-tight"> {{ animate.whyUs.whyChooseUs.title }} </h2>
                    <p class="text-lg text-gray-600 max-w-2xl mx-auto">{{ animate.whyUs.whyChooseUs.content }}</p>
                </div>

                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow" v-for="outcome in animate.steps2.steps_2" :key="outcome.id">
                        <div class="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-3xl mb-5">
                            <Vue3Lottie
                            :animation-data="animate[outcome.icon]"
                            :height="50"
                            :width="50"
                        />
                        </div>
                        <h3 class="text-2xl font-bold mb-3 text-gray-900">
                            {{outcome.title}}
                        </h3>
                        <p class="text-gray-600 leading-relaxed">
                            {{outcome.content}}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { Vue3Lottie } from "vue3-lottie";

// built in vuejs
import { onMounted, computed } from "vue";
import { RouterLink } from "vue-router";

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


const animate = {
    discover, question, normal, steps, ripple,
    steps_outcome, path, job, whyUs, steps2
}

const user = useUserStore();

onMounted(async () => {
    await user.fetchCurrentUser();
});

</script>

<style scoped>

</style>
