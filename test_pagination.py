import json

def get_paginated_thoughts(thoughts, page, thoughts_per_page):
    page -= 1  # Adjust for zero-based index
    start_index = page * thoughts_per_page
    end_index = start_index + thoughts_per_page
    return thoughts[start_index:end_index]


def test_pagination():
    with open('thoughts.json', 'r') as f:
        thoughts = json.load(f)

    thoughts_per_page = 5

    # Test page 1
    page_1_thoughts = get_paginated_thoughts(thoughts, 1, thoughts_per_page)
    assert len(page_1_thoughts) == 5
    assert page_1_thoughts[0]['quote'] == "Most of the time you are not thinking<br>You are just repeating patterns from your memory. You are just struck in memory"

    # Test page 2
    page_2_thoughts = get_paginated_thoughts(thoughts, 2, thoughts_per_page)
    assert len(page_2_thoughts) == 5
    assert page_2_thoughts[0]['quote'] == "Fractals do make patterns of life<br>But they never repeat in Meanings, Fate and regularities<br>You will never be able to understand with a competent Law."

    # Test page 3 (should have 0 thoughts)
    page_3_thoughts = get_paginated_thoughts(thoughts, 3, thoughts_per_page)
    assert len(page_3_thoughts) == 0
