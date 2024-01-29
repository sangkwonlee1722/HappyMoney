self.addEventListener("push", (event) => {
  const { title, body, tag, data } = JSON.parse(event.data && event.data.text());
  event.waitUntil(
    self.registration.showNotification(title || "", { body, tag, data })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data.url || "http://localhost:3000/views/main.html";
  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true
      })
      .then(function (clientList) {
        if (clientList.length > 0) {
          return clientList[0]
            .focus()
            .then((client) => client.navigate(urlToOpen));
        }
        return self.clients.openWindow(urlToOpen);
      })
  );
});

