import {
  Association,
  CreationOptional,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  literal,
} from "sequelize"

import sequelize from "@/db/db-client"

import TravelAuthorizationPreApproval from "@/models/travel-authorization-pre-approval"
import TravelAuthorizationPreApprovalDocument from "@/models/travel-authorization-pre-approval-document"

/**
 * Keep in sync with web/src/api/travel-authorization-pre-approval-submissions-api.js
 */
export enum Statuses {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  FINISHED = "finished",
}

export class TravelAuthorizationPreApprovalSubmission extends Model<
  InferAttributes<TravelAuthorizationPreApprovalSubmission>,
  InferCreationAttributes<TravelAuthorizationPreApprovalSubmission>
> {
  static readonly Statuses = Statuses

  declare preTSubID: CreationOptional<number>
  declare submitter: string
  declare status: string
  declare submissionDate: CreationOptional<Date | null>
  declare approvalDate: CreationOptional<Date | null>
  declare approvedBy: CreationOptional<string | null>
  declare department: CreationOptional<string | null>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getDocuments: HasManyGetAssociationsMixin<TravelAuthorizationPreApprovalDocument>
  declare setDocuments: HasManySetAssociationsMixin<
    TravelAuthorizationPreApprovalDocument,
    TravelAuthorizationPreApprovalDocument["preTSubID"]
  >
  declare hasDocument: HasManyHasAssociationMixin<
    TravelAuthorizationPreApprovalDocument,
    TravelAuthorizationPreApprovalDocument["preTSubID"]
  >
  declare hasDocuments: HasManyHasAssociationsMixin<
    TravelAuthorizationPreApprovalDocument,
    TravelAuthorizationPreApprovalDocument["preTSubID"]
  >
  declare addDocument: HasManyAddAssociationMixin<
    TravelAuthorizationPreApprovalDocument,
    TravelAuthorizationPreApprovalDocument["preTSubID"]
  >
  declare addDocuments: HasManyAddAssociationsMixin<
    TravelAuthorizationPreApprovalDocument,
    TravelAuthorizationPreApprovalDocument["preTSubID"]
  >
  declare removeDocument: HasManyRemoveAssociationMixin<
    TravelAuthorizationPreApprovalDocument,
    TravelAuthorizationPreApprovalDocument["preTSubID"]
  >
  declare removeDocuments: HasManyRemoveAssociationsMixin<
    TravelAuthorizationPreApprovalDocument,
    TravelAuthorizationPreApprovalDocument["preTSubID"]
  >
  declare countDocuments: HasManyCountAssociationsMixin
  declare createDocument: HasManyCreateAssociationMixin<TravelAuthorizationPreApprovalDocument>

  declare getPreApprovals: HasManyGetAssociationsMixin<TravelAuthorizationPreApproval>
  declare setPreApprovals: HasManySetAssociationsMixin<
    TravelAuthorizationPreApproval,
    TravelAuthorizationPreApproval["submissionId"]
  >
  declare hasPreApproval: HasManyHasAssociationMixin<
    TravelAuthorizationPreApproval,
    TravelAuthorizationPreApproval["submissionId"]
  >
  declare hasPreApprovals: HasManyHasAssociationsMixin<
    TravelAuthorizationPreApproval,
    TravelAuthorizationPreApproval["submissionId"]
  >
  declare addPreApproval: HasManyAddAssociationMixin<
    TravelAuthorizationPreApproval,
    TravelAuthorizationPreApproval["submissionId"]
  >
  declare addPreApprovals: HasManyAddAssociationsMixin<
    TravelAuthorizationPreApproval,
    TravelAuthorizationPreApproval["submissionId"]
  >
  declare removePreApproval: HasManyRemoveAssociationMixin<
    TravelAuthorizationPreApproval,
    TravelAuthorizationPreApproval["submissionId"]
  >
  declare removePreApprovals: HasManyRemoveAssociationsMixin<
    TravelAuthorizationPreApproval,
    TravelAuthorizationPreApproval["submissionId"]
  >
  declare countPreApprovals: HasManyCountAssociationsMixin
  declare createPreApproval: HasManyCreateAssociationMixin<TravelAuthorizationPreApproval>

  declare documents?: NonAttribute<TravelAuthorizationPreApprovalDocument[]>
  declare preApprovals?: NonAttribute<TravelAuthorizationPreApproval>

  declare static associations: {
    documents: Association<
      TravelAuthorizationPreApprovalSubmission,
      TravelAuthorizationPreApprovalDocument
    >
    preApprovals: Association<
      TravelAuthorizationPreApprovalSubmission,
      TravelAuthorizationPreApproval
    >
  }

  static establishAssociations() {
    this.hasMany(TravelAuthorizationPreApprovalDocument, {
      sourceKey: "preTSubID",
      foreignKey: "preTSubID",
      as: "documents",
    })
    this.hasMany(TravelAuthorizationPreApproval, {
      sourceKey: "preTSubID",
      foreignKey: "submissionId",
      as: "preApprovals",
    })
  }
}

TravelAuthorizationPreApprovalSubmission.init(
  {
    preTSubID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    submitter: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    submissionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: literal("CURRENT_DATE"),
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approvedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "TravelAuthorizationPreApprovalSubmission",
    tableName: "preapprovedSubmissions",
    underscored: false,
    timestamps: false,
    paranoid: false,
  }
)

export default TravelAuthorizationPreApprovalSubmission
