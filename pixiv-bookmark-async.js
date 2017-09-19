/*
// ==UserScript==
// @id             pixiv-bookmark-async
// @name           Pixiv Bookmark async
// @version        0.0.1
// @namespace      http://hkgsherlock.github.io/
// @author         hkgsherlock
// @description    Add a bookmark in Pixiv on background using Fetch API.
// @match          https://www.pixiv.net/member_illust.php?*
// @match          https://www.pixiv.net/setting_user.php
// @grant        none
// ==/UserScript==
*/

const PIXIV_API_URL = 'https://www.pixiv.net/rpc/index.php';
const BUTTON_TARGET_QUERY = '.bookmark-container .add-bookmark';

(() => {
	document.querySelector(BUTTON_TARGET_QUERY).addEventListener('click', (e) => {
		e.preventDefault();

		const queryString = document.location.search.substr(1)
			.split('&')
			.map((e) => {
				const [key, value] = e.split('=');
				return {[key]: value};
			})
			.reduce((a,b)=>Object.assign(a,b),{});

		// not ranbu sry (; _ ;)
		// https://google.com/search?q=pixiv+context+token
		const pixiv_context_token = window.pixiv.context.token;
		const illust_id = queryString.illust_id;
		const restricted = !!document.querySelector('.work-info .meta [class^="r-18"]');
		const comment = null;
		const tags = [...document.querySelectorAll('.tags .tag .text')].map((e) => e.innerText).join('+');

		fetch(PIXIV_API_URL, {
			method: "POST",
			headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
			},
  			credentials: "same-origin",
			body: [
				'mode=save_illust_bookmark',
				`illust_id=${illust_id}`,
				`restrict=${!!restricted?1:0}`,
				'comment'+(!!comment?`=${comment}`:''),
				'tags'+(!!tags?`=${tags}`:''),
				`tt=${pixiv_context_token}`,
			].join('&'),
		})
			.then((r) => r.json())
			.then((data) => {
				if (data.error) throw new Error(message || body.message);
				document.querySelector(BUTTON_TARGET_QUERY)
					.replaceWith(((id) => {
						const a = document.createElement('a');
						a.setAttribute('href', `bookmark_add.php?type=illust&illust_id=${id}`);
						a.classList.add('_bookmark-toggle-button');
						a.classList.add('bookmarked');
						a.classList.add('edit-bookmark');
						a.appendChild((() => {
							const span = document.createElement('span');
							span.classList.add('description');
							span.innerText = "ブックマークを編集";
						    return span;
						})());
						// a.appendChild((() => {
						// 	const span = document.createElement('span');
						// 	span.setAttribute('style', 'animation:nice-zoom-smile 1s forwards cubic-bezier(0.9, -1.5, 0.4, 1);position:absolute;top:-1px;left:33px;width:32px;height:32px;background-image:url(../images/bookmark-star-on.svg);background-position:center;background-repeat:no-repeat;background-size:cover;visibility:hidden;');
						//     return span;
						// })());
						return a;
					})(illust_id));
			})
			.catch((err) => console.error(err));
	});
})();