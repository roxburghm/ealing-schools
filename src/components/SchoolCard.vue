<template>
    <v-card class="mx-2" elevation="1">
        <v-card-text class="py-1 px-2" :class="{ 'disabled' : !school.visible}"
                     @click="$emit('school-visibility', school.visible)">
            <v-layout class="align-content-center">
                <v-flex>{{ school.name }}<br/>
                    <v-chip x-small>{{ school.rating }}</v-chip>
                </v-flex>
                <v-spacer/>
                <v-avatar class="mt-2" :color="school.colour" size="24"></v-avatar>
            </v-layout>
            <v-layout column class="caption font-italic" >
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
    }
}
</script>

<style scoped>

</style>
