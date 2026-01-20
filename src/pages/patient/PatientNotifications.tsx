import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Calendar,
  Pill,
  FlaskConical,
  CreditCard,
  Clock,
  CheckCircle,
  Trash2,
} from "lucide-react";

interface Notification {
  id: string;
  type:
    | "appointment"
    | "medicine"
    | "lab"
    | "payment"
    | "follow-up"
    | "general";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const PatientNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "appointment",
      title: "Appointment Reminder",
      message:
        "You have an appointment with Dr. Smith on Jan 20th at 10:00 AM",
      timestamp: "2026-01-15 09:00 AM",
      read: false,
    },
    {
      id: "2",
      type: "lab",
      title: "Lab Report Ready",
      message:
        "Your CBC and Blood Glucose reports are now available",
      timestamp: "2026-01-12 04:30 PM",
      read: false,
    },
    {
      id: "3",
      type: "medicine",
      title: "Medicine Reminder",
      message:
        "Time to take your Amlodipine 5mg (Morning dose)",
      timestamp: "2026-01-15 08:00 AM",
      read: true,
    },
    {
      id: "4",
      type: "payment",
      title: "Payment Reminder",
      message:
        "You have an outstanding bill of ₹2,350. Pay now to avoid late fees.",
      timestamp: "2026-01-14 10:00 AM",
      read: true,
    },
    {
      id: "5",
      type: "follow-up",
      title: "Follow-up Alert",
      message:
        "Your dental checkup is due in 2 weeks. Schedule now!",
      timestamp: "2026-01-10 11:00 AM",
      read: true,
    },
    {
      id: "6",
      type: "general",
      title: "Health Tip",
      message:
        "Stay hydrated! Drink at least 8 glasses of water daily.",
      timestamp: "2026-01-08 09:00 AM",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return (
          <Calendar className="h-5 w-5 text-blue-600" />
        );
      case "medicine":
        return (
          <Pill className="h-5 w-5 text-green-600" />
        );
      case "lab":
        return (
          <FlaskConical className="h-5 w-5 text-purple-600" />
        );
      case "payment":
        return (
          <CreditCard className="h-5 w-5 text-orange-600" />
        );
      case "follow-up":
        return (
          <Clock className="h-5 w-5 text-red-600" />
        );
      default:
        return (
          <Bell className="h-5 w-5 text-gray-600" />
        );
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Notifications & Reminders
            </h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount > 1 ? "s" : ""
                  }`
                : "All caught up!"}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No notifications
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${
                  !notification.read
                    ? "border-blue-200 bg-blue-50/30"
                    : ""
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-full ${
                        !notification.read
                          ? "bg-blue-100"
                          : "bg-muted"
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <Badge
                                variant="default"
                                className="text-xs"
                              >
                                New
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>

                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(
                              notification.timestamp
                            ).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                markAsRead(notification.id)
                              }
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              deleteNotification(notification.id)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientNotifications;
