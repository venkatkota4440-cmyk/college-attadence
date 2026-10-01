const prisma = require('../config/db');

const createAuditLog = async ({ userId, action, entity, entityId, oldValue, newValue, ipAddress }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: String(entityId),
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        ipAddress: ipAddress || '127.0.0.1',
      },
    });
  } catch (error) {
    console.error('Failed to create audit log entry:', error);
  }
};

module.exports = {
  createAuditLog,
};
