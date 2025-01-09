<template>
    <v-card class="mx-2" elevation="1">
        <v-card-text class="py-1 px-2" :class="{ 'disabled' : !school.visible}" @click="$emit('school-visibility', school.visible)">
            <v-layout class="align-content-center">
                <v-flex>{{ school.name }}<br/>
                    <v-tooltip bottom open-delay="200">
                        <template v-slot:activator="{ on, attrs }">
                            <span v-bind="attrs" v-on="on">
                                <v-chip x-small class="mr-1" :outlined="school.rating !== 'unknown'" :color="ratingColor">
                                    {{ school.rating }}
                                </v-chip>
                                <v-chip x-small v-if="school.progress8" :color="p8Color" :text-color="p8Color === 'yellow' ? 'black' : 'white'">
                                    p8: {{ school.progress8 }}
                                </v-chip>
                            </span>
                        </template>
                        
                        <v-card class="pa-2" min-width="200">
                            <v-card-title class="text-subtitle-1 py-1">{{ school.name }}</v-card-title>
                            <v-card-text class="py-1">
                                <div class="text-body-2">
                                    <div><strong>Ofsted Rating:</strong> {{ school.rating }}</div>
                                    <div v-if="school.progress8">
                                        <strong>Progress 8:</strong> {{ school.progress8 }}
                                        <v-chip x-small class="ml-1" outlined :color="confidenceColor">
                                            Confidence: {{ school.progress8Confidence }}
                                        </v-chip>
                                    </div>
                                    <div v-if="school.attainment8"><strong>Attainment 8:</strong> {{ school.attainment8 }}</div>
                                    <div v-if="school.grade5Above"><strong>Grade 5 & above:</strong> {{ school.grade5Above }}%</div>
                                    <div>
                                        <strong>Intake Distance:</strong> 
                                        {{ school.intakeDist[year] ? `${school.intakeDist[year]}mi` : 'All applicants admitted' }}
                                    </div>
                                    <div v-if="school.notes" class="mt-1 font-italic">{{ school.notes }}</div>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-tooltip>
                </v-flex>
                <v-spacer/>
                <v-avatar class="mt-2" :color="school.colour" size="24"></v-avatar>
            </v-layout>
            <v-layout column class="caption font-italic">
                <v-flex v-if="school.intakeDist[year] === null">
                    All applicants admitted
                </v-flex>
                <v-flex v-if="school.notes !== null">
                    {{ school.notes }}
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: "SchoolCard",
    props: {
        school: {type: Object, required: true},
        year: {type: String, required: true}
    },
    computed: {
        p8Color() {
            const p8 = parseFloat(this.school.progress8);
            if (p8 < 0) return 'red lighten-3';
            if (p8 < 0.5) return 'yellow lighten-3';
            return 'green lighten-3';
        },
        ratingColor() {
            switch (this.school.rating.toLowerCase()) {
                case 'outstanding': return 'green';
                case 'good': return 'orange';
                case 'inadequate': return 'red';
                default: return 'grey';
            }
        },
        confidenceColor() {
            switch (this.school.progress8Confidence.toLowerCase()) {
                case 'low': return 'red lighten-2';
                case 'medium': return 'orange';
                case 'high': return 'green';
                default: return 'grey';
            }
        }
    }
}
</script>

<style scoped>
.v-tooltip__content {
    background: white !important;
    color: rgba(0, 0, 0, 0.87) !important;
    opacity: 1 !important;
}
</style>
