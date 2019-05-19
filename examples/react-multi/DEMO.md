# examples/react-multi

[source](https://github.com/robseaman/precor/web-api-bridge/tree/master/examples/react-multi/)

<iframe src="https://precor.github.io/web-api-bridge/examples/react-multi/parent/build/" width="320" height="512" frameborder="0" style="float: left; margin-right: 10px" ></iframe>

This example shows how a parent window can exchange messages with multiple iframe children supporting any number of apis. It also demonstrates how a single web app loaded as multiple iframe instances can independently communicate with a parent using the same api.

The parent window uses an iframe to display a full page photo from [Lorem Picsum](https://picsum.photos/). Then it displays a small row of four iframes over the top of the full sized photo that each display a selectable photo. The parent supports two apis, `Api1` has a single function is supported by the iframe that displays the full size photo with a specific `id`. `Api2` is supported by the smaller iframes. These smaller iframes use a function in `Api2` that is called when they are clicked on, to send the `id` of their photo to the parent. The parent then uses the function in `Api1` to change the full screen image. When a photo is selected the parent also uses an additional function in `Api2` to request a new photo in all of the smaller non-selected iframes.

The parent displays these iframes from two different webapps. `webapp1` displays the fully sized iframe, supporting `Api1`, using the path `/#/page1/`, and displays the second iframe, supporting `Api2`, using the path `/#/page2`. Two instances of `webapp2` are luanched in the final two iframes, each supporting `Api2`.