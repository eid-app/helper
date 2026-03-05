# e-ID Helper Library

This library provides a seamless bridge between a web application and the **e-ID app** (electronic identity card reader). It handles data transmission via URL hashes, manages local storage for cross-tab communication, and provides user notifications when data is ready.

---

## Features

* **Automatic Protocol Linking:** Converts `eid-app:` links into valid application protocols targeting the current URL.
* **Cross-Tab Communication:** Uses `LocalStorage` to pass e-ID data from the reader's return tab back to your main application tab.
* **Loading State:** Automatically hides page content and displays a CSS loader while processing e-ID data.
* **Smart Notifications:** Uses the Browser Notification API to alert users when their data has been received, especially useful if the browser loses focus.
* **Simple Callback API:** Assign a `read` function directly to your anchor elements to handle the resulting JSON data.

---

## How It Works

1. **The Trigger:** The user clicks a link with `href="eid-app:"`.
2. **The App:** The e-ID application opens, reads the card, and redirects the user back to your URL with the card data encoded in the `#hash`.
3. **The Processing:** `eid-helper.js` detects the hash, saves the data to `localStorage`, and closes the "return" tab.
4. **The Callback:** The original tab listens for the storage event, retrieves the data, and triggers the `read` callback assigned to the link.

---

## Installation

Include the helper script in the `<head>` of your HTML document:

```html
<script src="https://cdn.jsdelivr.net/gh/eid-app/helper/eid-helper.js"></script>

```

---

## Usage

### 1. Basic Implementation

Create a link with the special `eid-app:` protocol. You must provide an `id` or let the script generate one to bind the callback.

```html
<a id="register" href="eid-app:">Register using e-ID card</a>

<script>
    document.querySelector('#register').read = function(data) {
        if (data.error) {
            console.error("Error:", data.error);
            return;
        }
        console.log("Card Data:", data);
    };
</script>

```

### 2. Enabling Desktop Notifications

To alert the user with a system notification when the data is ready, add the `data-alert` attribute to your link:

```html
<a id="register" href="eid-app:" data-alert>Read e-ID card content</a>

```

---

## Data Structure

Sample `data` object returned to the `read` callback:

| Property | Description |
| --- | --- |
| `firstnames` | The card holder's first name. |
| `surname` | The card holder's last name. |
| `photo` | A Base64 encoded string of the ID photo. |
| `error` | (Optional) Contains an error message if the read failed. |

---

## Handling the Card Photo

The e-ID data object includes a `photo` property containing a Base64-encoded JPEG image. You can display this by prefixing it with the appropriate Data URI scheme.

#### Example

```javascript
document.querySelector('#register').read = function(data) {
    if (data.photo) {
        var img = document.createElement('img');
        img.src = 'data:image/jpeg;base64,' + data.photo;
        document.querySelector('#result').appendChild(img);
    }
};

```

---

## Troubleshooting & Technical Notes

### Notifications

* If `data-alert` is used, the browser will request permission to show notifications.
* Notifications are automatically closed when the window regains focus.

### Local Storage Synchronization

* The script uses the `storage` event listener to detect when data is ready.
* **Security:** Data is removed from `localStorage` immediately after being read to ensure privacy.

### CSS Customization

The script injects a default full-screen loader by hiding the `body` and showing a `.loader` element. You can override these styles (like the animation or colors) in your own stylesheet.

---
