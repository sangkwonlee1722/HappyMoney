self.addEventListener("push", (event) => {
  let { title, body, tag } = JSON.parse(event.data && event.data.text());
  event.waitUntil(
    self.registration.showNotification(title || "", { body, tag })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = "http://localhost:3000/views/main.html";
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