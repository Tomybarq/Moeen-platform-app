import { EventEmitter } from "events";
import { sendMockNotification } from "./notifications";

// إنشاء موزع التنبيهات استناداً إلى EventEmitter
export const notificationDispatcher = new EventEmitter();

// 1. الاستماع لحدث إنشاء مستفيد جديد
notificationDispatcher.on(
  "beneficiary.created",
  async (data: { beneficiary: any; sessionUserId: number }) => {
    try {
      const { beneficiary, sessionUserId } = data;
      await sendMockNotification({
        userId: sessionUserId,
        title: `New beneficiary registered: ${beneficiary.name} (Status: ${beneficiary.status || "PENDING"})`,
        titleAr: `تم تسجيل مستفيد جديد: ${beneficiary.name} (الحالة: ${
          beneficiary.status === "ELIGIBLE" ? "مستحق" : beneficiary.status === "PENDING" ? "قيد الدراسة" : "غير مستحق"
        })`,
        message: `Beneficiary "${beneficiary.name}" has been registered. System eligibility check notes: ${beneficiary.notes || ""}`,
        messageAr: `تم تسجيل المستفيد "${beneficiary.name}" في النظام بنجاح. نتيجة فحص الاستحقاق التلقائي: ${beneficiary.notes || ""}`,
        type: beneficiary.status === "ELIGIBLE" ? "success" : beneficiary.status === "PENDING" ? "info" : "warning",
        channels: ["in-app", "sms", "email"],
        recipientPhone: beneficiary.phone,
      });
    } catch (error) {
      console.error("Error in beneficiary.created event listener:", error);
    }
  }
);

// 2. الاستماع لحدث تعديل مستفيد
notificationDispatcher.on(
  "beneficiary.updated",
  async (data: { beneficiary: any; sessionUserId: number }) => {
    try {
      const { beneficiary, sessionUserId } = data;
      await sendMockNotification({
        userId: sessionUserId,
        title: `Beneficiary updated: ${beneficiary.name}`,
        titleAr: `تم تحديث بيانات المستفيد: ${beneficiary.name}`,
        message: `Beneficiary details for "${beneficiary.name}" have been updated.`,
        messageAr: `تم تحديث تفاصيل المستفيد "${beneficiary.name}" بنجاح.`,
        type: "info",
        channels: ["in-app"],
      });
    } catch (error) {
      console.error("Error in beneficiary.updated event listener:", error);
    }
  }
);

// 3. الاستماع لحدث إنشاء جمعية جديدة
notificationDispatcher.on(
  "association.created",
  async (data: { association: any; sessionUserId: number }) => {
    try {
      const { association, sessionUserId } = data;
      await sendMockNotification({
        userId: sessionUserId,
        title: `New association registered: ${association.name}`,
        titleAr: `تم تسجيل جمعية جديدة: ${association.name}`,
        message: `The association "${association.name}" has been successfully added to the portal.`,
        messageAr: `تمت إضافة الجمعية "${association.name}" بنجاح في لوحة التحكم.`,
        type: "success",
        channels: ["in-app", "sms", "email"],
      });
    } catch (error) {
      console.error("Error in association.created event listener:", error);
    }
  }
);

// 4. الاستماع لحدث تعديل جمعية
notificationDispatcher.on(
  "association.updated",
  async (data: { association: any; sessionUserId: number }) => {
    try {
      const { association, sessionUserId } = data;
      await sendMockNotification({
        userId: sessionUserId,
        title: `Association updated: ${association.name}`,
        titleAr: `تم تحديث بيانات الجمعية: ${association.name}`,
        message: `Association details for "${association.name}" have been updated.`,
        messageAr: `تم تحديث تفاصيل الجمعية "${association.name}" بنجاح.`,
        type: "info",
        channels: ["in-app"],
      });
    } catch (error) {
      console.error("Error in association.updated event listener:", error);
    }
  }
);

// 5. الاستماع لحدث إنشاء مسوق جديد
notificationDispatcher.on(
  "marketer.created",
  async (data: { marketer: any; sessionUserId: number }) => {
    try {
      const { marketer, sessionUserId } = data;
      await sendMockNotification({
        userId: sessionUserId,
        title: `New marketer registered: ${marketer.name}`,
        titleAr: `تم تسجيل مسوق جديد: ${marketer.name}`,
        message: `The marketer "${marketer.name}" has been successfully added to the portal.`,
        messageAr: `تمت إضافة المسوق "${marketer.name}" بنجاح في لوحة التحكم.`,
        type: "success",
        channels: ["in-app", "sms", "email"],
      });
    } catch (error) {
      console.error("Error in marketer.created event listener:", error);
    }
  }
);

// 6. الاستماع لحدث تعديل مسوق
notificationDispatcher.on(
  "marketer.updated",
  async (data: { marketer: any; sessionUserId: number }) => {
    try {
      const { marketer, sessionUserId } = data;
      await sendMockNotification({
        userId: sessionUserId,
        title: `Marketer updated: ${marketer.name}`,
        titleAr: `تم تحديث بيانات المسوق: ${marketer.name}`,
        message: `Marketer details for "${marketer.name}" have been updated.`,
        messageAr: `تم تحديث تفاصيل المسوق "${marketer.name}" بنجاح.`,
        type: "info",
        channels: ["in-app"],
      });
    } catch (error) {
      console.error("Error in marketer.updated event listener:", error);
    }
  }
);
