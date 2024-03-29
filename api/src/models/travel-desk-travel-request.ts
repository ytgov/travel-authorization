import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize"

import TravelAuthorization from "./travel-authorization"
import TravelDeskPassengerNameRecordDocument from "./travel-desk-passenger-name-record-document"
import TravelDeskTravelAgent from "./travel-desk-travel-agent"

import sequelize from "@/db/db-client"

// Avoid exporting here, and instead expose via the Expense model to avoid naming conflicts
enum Statuses {
  BOOKED = "booked",
  DRAFT = "draft",
  OPTIONS_PROVIDED = "options_provided",
  OPTIONS_RANKED = "options_ranked",
  SUBMITTED = "submitted",
}

export class TravelDeskTravelRequest extends Model<
  InferAttributes<TravelDeskTravelRequest>,
  InferCreationAttributes<TravelDeskTravelRequest>
> {
  static Statuses = Statuses

  declare id: CreationOptional<number>
  declare travelAuthorizationId: ForeignKey<TravelAuthorization["id"]>
  declare travelDeskTravelAgentId: ForeignKey<TravelDeskTravelAgent["agencyID"]> | null
  declare legalFirstName: string
  declare legalMiddleName: string | null
  declare legalLastName: string
  declare birthDate: string | null
  declare strAddress: string
  declare city: string
  declare province: string
  declare postalCode: string
  declare passportCountry: string | null
  declare passportNum: string | null
  declare travelPurpose: string
  declare travelLocation: string | null
  declare travelNotes: string | null
  declare busPhone: string
  declare busEmail: string
  declare travelContact: boolean | null
  declare travelPhone: string | null
  declare travelEmail: string | null
  declare additionalInformation: string | null
  declare status: string
  declare travelDeskOfficer: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  // Associations
  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getTravelAuthorization: BelongsToGetAssociationMixin<TravelAuthorization>
  declare setTravelAuthorization: BelongsToSetAssociationMixin<
    TravelAuthorization,
    TravelAuthorization["id"]
  >
  declare createTravelAuthorization: BelongsToCreateAssociationMixin<TravelAuthorization>

  declare getTravelDeskPassengerNameRecordDocument: BelongsToGetAssociationMixin<TravelDeskPassengerNameRecordDocument>
  declare setTravelDeskPassengerNameRecordDocument: BelongsToSetAssociationMixin<
    TravelDeskPassengerNameRecordDocument,
    TravelDeskPassengerNameRecordDocument["travelDeskTravelRequestId"]
  >
  declare createTravelDeskPassengerNameRecordDocument: BelongsToCreateAssociationMixin<TravelDeskPassengerNameRecordDocument>

  declare getTravelDeskTravelAgent: BelongsToGetAssociationMixin<TravelDeskTravelAgent>
  declare setTravelDeskTravelAgent: BelongsToSetAssociationMixin<
    TravelDeskTravelAgent,
    TravelDeskTravelAgent["agencyID"]
  >
  declare createTravelDeskTravelAgent: BelongsToCreateAssociationMixin<TravelDeskTravelAgent>

  declare travelAuthorization?: NonAttribute<TravelAuthorization>
  declare travelDeskPassengerNameRecordDocument?: NonAttribute<TravelDeskPassengerNameRecordDocument>
  declare travelDeskTravelAgent?: NonAttribute<TravelDeskTravelAgent>

  declare static associations: {
    travelAuthorization: Association<TravelDeskTravelRequest, TravelAuthorization>
    travelDeskPassengerNameRecordDocument: Association<
      TravelDeskTravelRequest,
      TravelDeskPassengerNameRecordDocument
    >
    travelDeskTravelAgent: Association<TravelDeskTravelRequest, TravelDeskTravelAgent>
  }

  static establishAssociations() {
    this.hasOne(TravelDeskPassengerNameRecordDocument, {
      as: "travelDeskPassengerNameRecordDocument",
      sourceKey: "id",
      foreignKey: "travelDeskTravelRequestId",
    })
    this.belongsTo(TravelAuthorization, {
      as: "travelAuthorization",
      foreignKey: "travelAuthorizationId",
    })
    // TODO: enable this once TravelDeskTravelRequest model is set up
    // this.belongsTo(TravelDeskTravelAgent, {
    //   as: "travelDeskTravelAgent",
    //   foreignKey: "agencyID",
    // })
  }
}

TravelDeskTravelRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    travelAuthorizationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "travel_authorizations", // using real table name here
        key: "id", // using real column name here
      },
      onDelete: "CASCADE",
    },
    travelDeskTravelAgentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "travelDeskTravelAgent", // using real table name here
        key: "agencyID", // using real column name here
      },
      onDelete: "SET NULL",
    },
    legalFirstName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    legalLastName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    strAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    legalMiddleName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelPurpose: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    busPhone: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    busEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      set(value: string) {
        this.setDataValue("busEmail", value.toLowerCase())
      },
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(Statuses)],
          msg: "Invalid status value",
        },
      },
    },
    birthDate: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passportCountry: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passportNum: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelLocation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelNotes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelContact: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    travelPhone: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    additionalInformation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    travelDeskOfficer: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "TravelDeskTravelRequest",
    tableName: "travel_desk_travel_requests",
  }
)

export default TravelDeskTravelRequest
