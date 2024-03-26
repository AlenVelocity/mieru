// WORK IN PROGRESS
// DO NOT MODIFY THIS FILE

import { Browser, CDPSession, Page } from 'playwright'

class Crawler {
    private _page?: Page
    private client?: CDPSession
    private elements = new Map<number, any>()

    private get page() {
        if (!this._page) {
            throw new Error('Page is not initialized')
        }
        return this._page
    }

    private set page(page: Page) {
        this._page = page
    }

    constructor(private browser: Browser) {}

    public init = async () => {
        this.page = await this.browser.newPage()
        await this.page.setViewportSize({ width: 1280, height: 1080 })
    }

    public goTo = async (url: string) => {
        await this.page.goto(url)
        this.client = await this.page.context().newCDPSession(this.page)
        this.elements.clear()
    }

    public scroll = async (direction: 'up' | 'down') => {
        await this.page.evaluate((direction) => {
            window.scrollBy(0, direction === 'up' ? -window.innerHeight : window.innerHeight)
        }, direction)
    }

    public click = async (id: number) => {
        if (!this.page) {
            throw new Error('Page is not initialized')
        }
        this.page.evaluate(() => {
            const links = document.getElementsByTagName('a')
            for (let i = 0; i < links.length; i++) {
                links[i].removeAttribute('target')
            }
        })
        const element = this.elements.get(id)
        if (element) {
            await this.page.mouse.click(element.center_x, element.center_y)
        } else {
            throw new Error('Could not find element')
        }
    }

    public type = async (id: number, text: string) => {
        await this.click(id)
        await this.page.keyboard.type(text)
    }

    public enter = async () => {
        await this.page.keyboard.press('Enter')
    }

    public crawl = async () => {
        const {
            devicePixelRatio,
            winScrollX,
            winScrollY,
            winUpperBound,
            winLeftBound,
            winWidth,
            winHeight,
            documentOffsetHeight,
            documentScrollHeight
        } = await this.page.evaluate(() => {
            return {
                devicePixelRatio: window.devicePixelRatio,
                winScrollX: window.scrollX,
                winScrollY: window.scrollY,
                winUpperBound: window.pageYOffset,
                winLeftBound: window.pageXOffset,
                winWidth: window.screen.width,
                winHeight: window.screen.height,
                documentOffsetHeight: document.body.offsetHeight,
                documentScrollHeight: document.body.scrollHeight
            }
        })

        const winRightBound = winLeftBound + winWidth
        const winLowerBound = winUpperBound + winHeight

        const percentageProgressStart = (winUpperBound / documentScrollHeight) * 100
        const percentageProgressEnd = ((winHeight + winUpperBound) / documentScrollHeight) * 100

        const pageStateAsText = [
            {
                x: 0,
                y: 0,
                text: `[scrollbar ${percentageProgressStart.toFixed(2)}-${percentageProgressEnd.toFixed(2)}%]`
            }
        ]

        const tree = await this.client?.send('DOMSnapshot.captureSnapshot', {
            computedStyles: [],
            includeDOMRects: true,
            includePaintOrder: true
        })

        /*
        strings	 	= tree["strings"]
		document 	= tree["documents"][0]
		nodes 		= document["nodes"]
		backend_node_id = nodes["backendNodeId"]
		attributes 	= nodes["attributes"]
		node_value 	= nodes["nodeValue"]
		parent 		= nodes["parentIndex"]
		node_types 	= nodes["nodeType"]
		node_names 	= nodes["nodeName"]
		is_clickable = set(nodes["isClickable"]["index"])

		text_value 			= nodes["textValue"]
		text_value_index 	= text_value["index"]
		text_value_values 	= text_value["value"]

		input_value 		= nodes["inputValue"]
		input_value_index 	= input_value["index"]
		input_value_values 	= input_value["value"]

		input_checked 		= nodes["inputChecked"]
		layout 				= document["layout"]
		layout_node_index 	= layout["nodeIndex"]
		bounds 				= layout["bounds"]

		cursor = 0
		html_elements_text = []

		child_nodes = {}
		elements_in_view_port = []

		anchor_ancestry = {"-1": (False, None)}
		button_ancestry = {"-1": (False, None)}

        */

        const strings = tree?.strings
        const documents = tree?.documents[0]
        const nodes = documents?.nodes
        const attributes = nodes?.attributes
        const nodeValue = nodes?.nodeValue
        const parent = nodes?.parentIndex
        const nodeType = nodes?.nodeType
        const nodeName = nodes?.nodeName
        const isClickable = nodes?.isClickable

        const textValue = nodes?.textValue
        const textValueIndex = textValue?.index
        const textValueValues = textValue?.value

        const inputValue = nodes?.inputValue
        const inputValueIndex = inputValue?.index
        const inputValueValues = inputValue?.value

        const inputChecked = nodes?.inputChecked
        const layout = documents?.layout
        const layoutNodeIndex = layout?.nodeIndex
        const bounds = layout?.bounds

        let cursor = 0
        const htmlElementsText = []

        const childNodes = {}
        const elementsInViewPort = []

        const anchorAncestry = { '-1': [false, null] }
        const buttonAncestry = { '-1': [false, null] }

        const convertName = (nodeName: string, hasClickHandler: boolean) => {
            if (nodeName === 'a') {
                return 'link'
            }
            if (nodeName === 'input') {
                return 'input'
            }
            if (nodeName === 'img') {
                return 'img'
            }
            if (nodeName === 'button' || hasClickHandler) {
                return 'button'
            } else {
                return 'text'
            }
        }

        const findAttributes = (attributes: number[], keys: string[]) => {
            const values: { [key: string]: string } = {}

            for (let i = 0; i < attributes.length; i += 2) {
                const keyIndex = attributes[i]
                const valueIndex = attributes[i + 1]
                if (valueIndex < 0) {
                    continue
                }
                const key = strings![keyIndex]
                const value = strings![valueIndex]

                if (keys.includes(key)) {
                    values[key] = value
                    keys.splice(keys.indexOf(key), 1)

                    if (keys.length === 0) {
                        return values
                    }
                }
            }

            return values
        }

        /*def add_to_hash_tree(hash_tree, tag, node_id, node_name, parent_id):
			parent_id_str = str(parent_id)
			if not parent_id_str in hash_tree:
				parent_name = strings[node_names[parent_id]].lower()
				grand_parent_id = parent[parent_id]

				add_to_hash_tree(
					hash_tree, tag, parent_id, parent_name, grand_parent_id
				)

			is_parent_desc_anchor, anchor_id = hash_tree[parent_id_str]

			# even if the anchor is nested in another anchor, we set the "root" for all descendants to be ::Self
			if node_name == tag:
				value = (True, node_id)
			elif (
				is_parent_desc_anchor
			):  # reuse the parent's anchor_id (which could be much higher in the tree)
				value = (True, anchor_id)
			else:
				value = (
					False,
					None,
				)  # not a descendant of an anchor, most likely it will become text, an interactive element or discarded

			hash_tree[str(node_id)] = value

			return value

		for index, node_name_index in enumerate(node_names):
			node_parent = parent[index]
			node_name = strings[node_name_index].lower()

			is_ancestor_of_anchor, anchor_id = add_to_hash_tree(
				anchor_ancestry, "a", index, node_name, node_parent
			)

			is_ancestor_of_button, button_id = add_to_hash_tree(
				button_ancestry, "button", index, node_name, node_parent
			)

			try:
				cursor = layout_node_index.index(
					index
				)  # todo replace this with proper cursoring, ignoring the fact this is O(n^2) for the moment
			except:
				continue

			if node_name in black_listed_elements:
				continue

			[x, y, width, height] = bounds[cursor]
			x /= device_pixel_ratio
			y /= device_pixel_ratio
			width /= device_pixel_ratio
			height /= device_pixel_ratio

			elem_left_bound = x
			elem_top_bound = y
			elem_right_bound = x + width
			elem_lower_bound = y + height

			partially_is_in_viewport = (
				elem_left_bound < win_right_bound
				and elem_right_bound >= win_left_bound
				and elem_top_bound < win_lower_bound
				and elem_lower_bound >= win_upper_bound
			)

			if not partially_is_in_viewport:
				continue

			meta_data = []

			# inefficient to grab the same set of keys for kinds of objects but its fine for now
			element_attributes = find_attributes(
				attributes[index], ["type", "placeholder", "aria-label", "title", "alt"]
			)

			ancestor_exception = is_ancestor_of_anchor or is_ancestor_of_button
			ancestor_node_key = (
				None
				if not ancestor_exception
				else str(anchor_id)
				if is_ancestor_of_anchor
				else str(button_id)
			)
			ancestor_node = (
				None
				if not ancestor_exception
				else child_nodes.setdefault(str(ancestor_node_key), [])
			)

			if node_name == "#text" and ancestor_exception:
				text = strings[node_value[index]]
				if text == "|" or text == "•":
					continue
				ancestor_node.append({
					"type": "type", "value": text
				})
			else:
				if (
					node_name == "input" and element_attributes.get("type") == "submit"
				) or node_name == "button":
					node_name = "button"
					element_attributes.pop(
						"type", None
					)  # prevent [button ... (button)..]
				
				for key in element_attributes:
					if ancestor_exception:
						ancestor_node.append({
							"type": "attribute",
							"key":  key,
							"value": element_attributes[key]
						})
					else:
						meta_data.append(element_attributes[key])

			element_node_value = None

			if node_value[index] >= 0:
				element_node_value = strings[node_value[index]]
				if element_node_value == "|": #commonly used as a seperator, does not add much context - lets save ourselves some token space
					continue
			elif (
				node_name == "input"
				and index in input_value_index
				and element_node_value is None
			):
				node_input_text_index = input_value_index.index(index)
				text_index = input_value_values[node_input_text_index]
				if node_input_text_index >= 0 and text_index >= 0:
					element_node_value = strings[text_index]

			# remove redudant elements
			if ancestor_exception and (node_name != "a" and node_name != "button"):
				continue

			elements_in_view_port.append(
				{
					"node_index": str(index),
					"backend_node_id": backend_node_id[index],
					"node_name": node_name,
					"node_value": element_node_value,
					"node_meta": meta_data,
					"is_clickable": index in is_clickable,
					"origin_x": int(x),
					"origin_y": int(y),
					"center_x": int(x + (width / 2)),
					"center_y": int(y + (height / 2)),
				}
			)

		# lets filter further to remove anything that does not hold any text nor has click handlers + merge text from leaf#text nodes with the parent
		elements_of_interest= []
		id_counter 			= 0

		for element in elements_in_view_port:
			node_index = element.get("node_index")
			node_name = element.get("node_name")
			node_value = element.get("node_value")
			is_clickable = element.get("is_clickable")
			origin_x = element.get("origin_x")
			origin_y = element.get("origin_y")
			center_x = element.get("center_x")
			center_y = element.get("center_y")
			meta_data = element.get("node_meta")

			inner_text = f"{node_value} " if node_value else ""
			meta = ""
			
			if node_index in child_nodes:
				for child in child_nodes.get(node_index):
					entry_type = child.get('type')
					entry_value= child.get('value')

					if entry_type == "attribute":
						entry_key = child.get('key')
						meta_data.append(f'{entry_key}="{entry_value}"')
					else:
						inner_text += f"{entry_value} "

			if meta_data:
				meta_string = " ".join(meta_data)
				meta = f" {meta_string}"

			if inner_text != "":
				inner_text = f"{inner_text.strip()}"

			converted_node_name = convert_name(node_name, is_clickable)

			# not very elegant, more like a placeholder
			if (
				(converted_node_name != "button" or meta == "")
				and converted_node_name != "link"
				and converted_node_name != "input"
				and converted_node_name != "img"
				and converted_node_name != "textarea"
			) and inner_text.strip() == "":
				continue

			page_element_buffer[id_counter] = element

			if inner_text != "": 
				elements_of_interest.append(
					f"""<{converted_node_name} id={id_counter}{meta}>{inner_text}</{converted_node_name}>"""
				)
			else:
				elements_of_interest.append(
					f"""<{converted_node_name} id={id_counter}{meta}/>"""
				)
			id_counter += 1

		print("Parsing time: {:0.2f} seconds".format(time.time() - start))
		return elements_of_interest */
        const addToHashTree = (
            hashTree: { [key: string]: [boolean, number | null] },
            tag: string,
            nodeId: number,
            nodeName: string,
            parentId: number
        ) => {
            const parentIdStr = parentId.toString()
            if (!hashTree[parentIdStr]) {
                const parentName = strings![nodeName![parentIdStr]].toLowerCase()
                const grandParentId = parent![parentId]
                addHashTree(hashTree, tag, parentId, parentName, grandParentId)
            }

            const [isParentDescAnchor, anchorId] = hashTree[parentIdStr]

            let value
            if (nodeName === tag) {
                value = [true, nodeId]
            } else if (isParentDescAnchor) {
                value = [true, anchorId]
            } else {
                value = [false, null]
            }

            hashTree[nodeId.toString()] = value

            return value
        }

        const findElementAttributes = (attributes: number[], keys: string[]) => {
            const values: { [key: string]: string } = {}

            for (let i = 0; i < attributes.length; i += 2) {
                const keyIndex = attributes[i]
                const valueIndex = attributes[i + 1]
                if (valueIndex < 0) {
                    continue
                }
                const key = strings![keyIndex]
                const value = strings![valueIndex]

                if (keys.includes(key)) {
                    values[key] = value
                    keys.splice(keys.indexOf(key), 1)

                    if (keys.length === 0) {
                        return values
                    }
                }
            }

            return values
        }

        const addElement = (element, nodeIndex) => {
            const nodeParent = parent![nodeIndex]
            const nodeName = strings![nodeNames![nodeIndex]].toLowerCase()

            const [isAncestorOfAnchor, anchorId] = addToHashTree(anchorAncestry, 'a', nodeIndex, nodeName, nodeParent)
            const [isAncestorOfButton, buttonId] = addToHashTree(
                buttonAncestry,
                'button',
                nodeIndex,
                nodeName,
                nodeParent
            )

            try {
                cursor = layoutNodeIndex!.indexOf(nodeIndex)
            } catch (e) {
                return
            }

            if (blackListedElements.includes(nodeName)) {
                return
            }

            const [x, y, width, height] = bounds![cursor]
            const elemLeftBound = x / devicePixelRatio
            const elemTopBound = y / devicePixelRatio
            const elemRightBound = (x + width) / devicePixelRatio
            const elemLowerBound = (y + height) / devicePixelRatio

            const partiallyIsInViewPort =
                elemLeftBound < winRightBound &&
                elemRightBound >= winLeftBound &&
                elemTopBound < winLowerBound &&
                elemLowerBound >= winUpperBound

            if (!partiallyIsInViewPort) {
                return
            }

            const metaData = []

            const elementAttributes = findElementAttributes(attributes![nodeIndex], [
                'type',
                'placeholder',
                'aria-label',
                'title',
                'alt'
            ])

            const ancestorException = isAncestorOfAnchor || isAncestorOfButton
            const ancestorNodeKey = ancestorException ? (isAncestorOfAnchor ? anchorId : buttonId) : null
            const ancestorNode = ancestorException ? childNodes[ancestorNodeKey] : null

            let elementNodeValue = null

            if (nodeValue![nodeIndex] >= 0) {
                elementNodeValue = strings![nodeValue![nodeIndex]]
                if (elementNodeValue === '|') {
                    return
                }
            } else if (nodeName === 'input' && inputValueIndex!.includes(nodeIndex) && elementNodeValue === null) {
                const nodeInputTextIndex = inputValueIndex!.indexOf(nodeIndex)
                const textIndex = inputValueValues![nodeInputTextIndex]
                if (nodeInputTextIndex >= 0 && textIndex >= 0) {
                    elementNodeValue = strings![textIndex]
                }
            }

            if (ancestorException && nodeName !== 'a' && nodeName !== 'button') {
                return
            }

            elementsInViewPort.push({
                nodeIndex: nodeIndex,
                backendNodeId: backendNodeId![nodeIndex],
                nodeName: nodeName,
                nodeValue: elementNodeValue,
                nodeMeta: metaData,
                isClickable: isClickable!.includes(nodeIndex),
                originX: x,
                originY: y,
                centerX: x + width / 2,
                centerY: y + height / 2
            })
        }
    }
}
