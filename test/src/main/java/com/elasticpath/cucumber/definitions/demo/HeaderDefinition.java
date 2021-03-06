/**
 * Copyright © 2018 Elastic Path Software Inc. All rights reserved.
 *
 * This is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this license. If not, see
 *
 *     https://www.gnu.org/licenses/
 *
 *
 */

package com.elasticpath.cucumber.definitions.demo;

import cucumber.api.java.en.Given;

import com.elasticpath.selenium.SetUp;
import com.elasticpath.selenium.pages.HeaderPage;

public class HeaderDefinition {
	private HeaderPage headerPage;

	public HeaderDefinition() {
		headerPage = new HeaderPage(SetUp.getDriver());
	}

	@Given("^I select category (.+)$")
	public void selectCategory(final String categoryName) {
		headerPage.selectCategory(categoryName);
	}

	@Given("^I select parent category (.+) and sub category (.+)$")
	public void selectParentAndSubCategory(final String parentCategoryName, final String subCategoryName) {
		headerPage.selectParentCategory(parentCategoryName);
		if (!subCategoryName.equals("-")) {
			headerPage.selectSubCategory(parentCategoryName, subCategoryName);
		}
	}

}
