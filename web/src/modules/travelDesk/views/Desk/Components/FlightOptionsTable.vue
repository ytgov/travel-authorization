<template>
    <div>
        <title-card class="mt-5" titleWidth="7rem" largeTitle :border="'1px solid #FFEEDD !important'">
            <template #title>
                <div class="brown--text">Grouping</div>
            </template>
            <template #body>
                             
                <v-data-table
                    :headers="headers"
                    :items="flightOptions"
                    :items-per-page="-1"                               
                    class="mt-3"
                    :hide-default-footer="true"
                    :hide-default-header="true"
                    >                   
                    <template v-slot:[`item.name`]="{ item, index }">
                        <title-card class="my-5" titleWidth="4.5rem" :border="'1px solid #AAEEFF !important'">
                            <template #title>
                                <v-row class="mx-0 blue--text">Group {{index+1}}</v-row>
                            </template>
                            <template #body>
                                <v-row class="mx-3 mt-0 mb-n8">
                                    <v-col cols="3">
                                        <v-text-field								
                                            :error="item.state.costErr"
                                            @input="item.state.costErr=false"								
                                            label="Cost"
                                            prefix="$"
                                            v-model="item.cost"
                                            type="number"								
                                            outlined/>
                                    </v-col>
                                    <v-col cols="3">
                                        <v-text-field								
                                            readonly                                    								
                                            label="Travel Duration"
                                            v-model="item.duration"								
                                            outlined/>
                                    </v-col>
                                    <v-col cols="5">
                                        <v-select
                                            :items="legs"								
                                            :error="item.state.legErr"
                                            @input="item.state.legErr=false"
                                            item-value="flightRequestID"
                                            label="Leg"
                                            v-model="item.flightRequestID"								
                                            outlined/>
                                    </v-col>                                    
                                </v-row>
                                <div v-for="segment,inx in (item.flightSegments)" :key="'group-'+segment.FlightSegmentID+'-'+inx+flightKey">                                    
                                    <v-row class="my-0 mx-0">
                                        <div style="width:3%;  display:flex; align-items:center;">
                                            <div style="cursor:pointer; background: #CCEEFE; border-radius:5px; margin:0 0.3rem;"
                                                @dragover.prevent
                                                @drop.prevent="drop(item, segment, index)"   
                                                :draggable="true"  
                                                @dragstart="drag(segment, index)">                                            
                                                <v-icon>mdi-arrow-all</v-icon>                                            
                                            </div>
                                        </div>
                                        <div style="width:97%;">
                                            <flight-segment class="mr-4 mb-2" :flightSegment="segment" />
                                        </div>                                        
                                    </v-row>
                                </div>
                            </template>
                        </title-card>
                    </template>

                </v-data-table>

                
            </template>
        </title-card>
    </div>
</template>

<script>
    import Vue from "vue";
    import TitleCard from '../../Common/TitleCard.vue'
    import FlightSegment from "./FlightSegment.vue";


    export default {
        components: {	 
            TitleCard,
            FlightSegment
        },
        name: "FlightOptionsTable",
        props: {
            readonly: Boolean,
            legs: {},
            flightOptions: {},
            ungroupedFlightSegments: {},            
        },
        data() {
            return {
                tmpId:1,
                admin: false,
                savingData: false,
                selectedSegments:[],
                headers:[ {text: "", value: "name", class: "red"} ], 
                source:{},
                sourceInx:-1,
                flightKey:0,               
            };
        },
        mounted() {	
            this.initForm()					
        },
        computed: {
            
        },
        methods: {
            
            initForm(){
                // const carRequest = {}							
            },            
            drag(source, index){
                this.source = source;
                this.sourceInx = index
                
            }, 
            drop(flightOption, target, index) 
            {
                if(this.sourceInx != index) return 

                const sortOrderTarget=target.sortOrder
                target.sortOrder = JSON.parse(JSON.stringify(this.source.sortOrder))
                this.source.sortOrder = JSON.parse(JSON.stringify(sortOrderTarget))
                Vue.nextTick(()=>{
                    this.sortByOrder(flightOption.flightSegments)
                })
            },
            sortByOrder(flight) { 
                flight.sort((a,b)=>{ return (a.sortOrder > b.sortOrder ? 1 :-1) })
                return flight
            },
            
        }
    };
</script>

<style scoped >
/* ::v-deep tbody tr:nth-of-type(even) {
   background-color: #FFFFFF !important;
 } */

::v-deep table tbody td {    
    border: 0px solid white !important;
    background-color: #FFFFFF !important;
}

</style>