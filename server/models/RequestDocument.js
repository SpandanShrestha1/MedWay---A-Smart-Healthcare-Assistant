export default (sequelize, DataTypes) => {
  const RequestDocument = sequelize.define(
    "RequestDocument",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      roleRequestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "role_request_id",
        references: {
          model: "role_requests",
          key: "id",
        },
      },
      documentUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: "document_url",
      },
      documentType: {
        type: DataTypes.ENUM(
          "medical_license",
          "pharmacy_license",
          "degree_certificate",
          "id_proof",
          "resume",
          "other"
        ),
        allowNull: false,
        field: "document_type",
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "request_documents",
      timestamps: true,
      underscored: true,
    }
  );

  return RequestDocument;
};
