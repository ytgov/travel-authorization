<template>
	<div>
		<v-dialog v-model="flightDialog" persistent  max-width="80%">
			<template v-slot:activator="{ on, attrs }">
				<v-btn
					:disabled="disabled"				
					:class="type=='Add New'? 'my-4 right':'mx-0 px-0'"					
					:color="type=='Add New'? 'primary':'transparent'"
					style="min-width: 0;"
					@click="initForm()"
					v-bind="attrs"
					v-on="on">
					<div v-if="type=='Add New'" >Add Flight</div>
					<v-icon v-else class="mx-0 px-0" color="blue">mdi-pencil</v-icon>
				</v-btn>
			</template>

			<v-card>
				
				<v-card-title class="blue" >
					<div class="text-h5">
						Add Flight
					</div>
				</v-card-title>

				<v-card-text>	

<!-- <ROW-1> -->
					<v-row class="mt-5 mx-0">
						<v-col cols="4">
							<v-autocomplete
								:items="destinations"								
								item-value="text"								
								:error="state.departLocationErr"
								@input="state.departLocationErr=false"								
								label="Depart Location"
								v-model="flightRequest.departLocation"								
								outlined/>
						</v-col>
						<v-col cols="4">
							<v-autocomplete
								:items="destinations"								
								item-value="text"								
								:error="state.arriveLocationErr"
								@input="state.arriveLocationErr=false"								
								label="Arrive Location"
								v-model="flightRequest.arriveLocation"								
								outlined/>
						</v-col>																
					</v-row>
<!-- <ROW-2> -->					
					<v-row class="mt-0 mx-0">
						
						<v-col cols="4">
							<v-text-field
								:readonly="readonly"
								:error="state.dateErr"
								v-model="date"
								:min="minDate"
								:max="maxDate"
								@input="state.dateErr = false"
								label="Date"
								outlined
								type="date"/>
						</v-col>
						<v-col cols="4">
							<div class="label">Time Preference</div>
							<v-radio-group								
								:error="state.timePreferenceErr"
								class="mt-1"								
								v-model="flightRequest.timePreference"
								row>
								<v-radio label="AM" value="AM"></v-radio>
								<v-radio label="PM" value="PM"></v-radio>
							</v-radio-group>
						</v-col>
						<v-col cols="4">
							<v-select
								:items="seatPreferenceList"								
								:error="state.seatPreferenceErr"
								@input="state.seatPreferenceErr=false"							
								label="Seat Preference"
								v-model="flightRequest.seatPreference"								
								outlined/>
							<!-- <div class="label"></div>
							<v-radio-group								
								:error=""
								class="mt-1"								
								v-model=""
								row>
								<v-radio label="Aisle" value="Aisle"></v-radio>
								<v-radio label="Middle" value="Middle"></v-radio>								
								<v-radio label="Window" value="Window"></v-radio>
								<v-radio label="Aisle" value="Aisle"></v-radio>
							</v-radio-group>	 -->
						</v-col>				
					</v-row>
				</v-card-text>

				<v-card-actions>
					<v-btn color="grey darken-5" @click="flightDialog = false">
						<div v-if="type == 'View'">Close</div>
						<div v-else>Cancel</div>
					</v-btn>					
					<v-btn						
						class="ml-auto"
						color="green darken-1"
						@click="saveFlightRequest()"
						>
						<div v-if="type == 'View'">Save</div>
						<div v-else>Add</div>
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>		

	
	</div>
</template>

<script>


	export default {		
		name: "NewFlightRequest",
		props: {
			disabled: {	type: Boolean, default:false },
			type: {	type: String },
			flightRequest: {},
			minDate: { type: String, default:""	},
			maxDate: { type: String, default:""	},
		},
		data() {
			return {							
				date: "",
				flightDialog: false,				
				readonly: false,
				seatPreferenceList: ["Aisle", "Middle", "Window", "No Preference"],			

				state: {
					departLocationErr: false,
					arriveLocationErr: false,	
					dateErr: false,
					timePreferenceErr: false,
					seatPreferenceErr: false
				},
				destinations:[],

			};
		},
		mounted() {
			this.destinations = this.$store.state.traveldesk.destinations;		
		},
		methods: {			
			checkFields() {
				this.state.departLocationErr = this.flightRequest.departLocation? false:true;
				this.state.arriveLocationErr = this.flightRequest.arriveLocation? false:true;

				this.state.dateErr = this.date? false: true;
				this.state.timePreferenceErr = this.flightRequest.timePreference? false:true;
				this.state.seatPreferenceErr = this.flightRequest.seatPreference? false:true;


				for (const key of Object.keys(this.state)) {
					if (this.state[key]) return false;
				}
				return true;
			},

			saveFlightRequest() {
				if (this.checkFields()) {					
					this.flightRequest.date=this.date;									
					this.$emit("updateTable",this.type)
					this.flightDialog= false
				}
			},

			initForm() {
				this.initStates();

				if(this.type == "Add New"){
					this.flightRequest.departLocation=""
					this.flightRequest.arriveLocation=""
					
					this.flightRequest.date=""
					this.flightRequest.timePreference=""
					this.flightRequest.seatPreference=""
					this.flightRequest.flightOptions=[]
					// this.flightRequest.status="Requested"//, Reserved"

					this.date="";
				}else{
					this.date=this.flightRequest.date;
				}				
			
			},

			initStates() {				
				for (const key of Object.keys(this.state)) {
					this.state[key] = false;
				}
			},

			

		}
	};
</script>

<style scoped lang="css" src="@/styles/_travel_desk.css">
.label {
	font-weight: 600;
	font-size: 10pt !important;
}
</style>