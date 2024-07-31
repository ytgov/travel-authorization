import db from "@/db/db-client"

import DistanceMatrix from "./distance-matrix"
import Expense from "./expense"
import GeneralLedgerCoding from "./general-ledger-coding"
import Location from "./location"
import PerDiem from "./per-diem"
import Role from "./role"
import Stop from "./stop"
import TravelAllowance from "./travel-allowance"
import TravelAuthorization from "./travel-authorization"
import TravelAuthorizationActionLog from "./travel-authorization-action-log"
import TravelAuthorizationPreApproval from "./travel-authorization-pre-approval"
import TravelAuthorizationPreApprovalDocument from "./travel-authorization-pre-approval-document"
import TravelAuthorizationPreApprovalProfile from "./travel-authorization-pre-approval-profile"
import TravelAuthorizationPreApprovalSubmission from "./travel-authorization-pre-approval-submission"
import TravelDeskFlightRequest from "./travel-desk-flight-request"
import TravelDeskHotel from "./travel-desk-hotel"
import TravelDeskOtherTransportation from "./travel-desk-other-transportation"
import TravelDeskPassengerNameRecordDocument from "./travel-desk-passenger-name-record-document"
import TravelDeskQuestion from "./travel-desk-question"
import TravelDeskRentalCar from "./travel-desk-rental-car"
import TravelDeskTravelRequest from "./travel-desk-travel-request"
import TravelPurpose from "./travel-purpose"
import TravelSegment from "./travel-segment"
import User from "./user"

Expense.establishAssociations()
GeneralLedgerCoding.establishAssociations()
Stop.establishAssociations()
TravelAuthorization.establishAssociations()
TravelAuthorizationActionLog.establishAssociations()
TravelAuthorizationPreApproval.establishAssociations()
TravelAuthorizationPreApprovalDocument.establishAssociations()
TravelAuthorizationPreApprovalProfile.establishAssociations()
TravelAuthorizationPreApprovalSubmission.establishAssociations()
TravelDeskFlightRequest.establishAssociations()
TravelDeskHotel.establishAssociations()
TravelDeskOtherTransportation.establishAssociations()
TravelDeskPassengerNameRecordDocument.establishAssociations()
TravelDeskQuestion.establishAssociations()
TravelDeskRentalCar.establishAssociations()
TravelDeskTravelRequest.establishAssociations()
TravelSegment.establishAssociations()
User.establishAssociations()

export {
  DistanceMatrix,
  Expense,
  GeneralLedgerCoding,
  Location,
  PerDiem,
  Role,
  Stop,
  TravelAllowance,
  TravelAuthorization,
  TravelAuthorizationActionLog,
  TravelAuthorizationPreApproval,
  TravelAuthorizationPreApprovalDocument,
  TravelAuthorizationPreApprovalProfile,
  TravelAuthorizationPreApprovalSubmission,
  TravelDeskFlightRequest,
  TravelDeskHotel,
  TravelDeskOtherTransportation,
  TravelDeskPassengerNameRecordDocument,
  TravelDeskQuestion,
  TravelDeskRentalCar,
  TravelDeskTravelRequest,
  TravelPurpose,
  TravelSegment,
  User,
}

// special db instance that has access to all models.
export default db
