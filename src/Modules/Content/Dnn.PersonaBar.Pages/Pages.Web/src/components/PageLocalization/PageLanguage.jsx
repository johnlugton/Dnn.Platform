import React, {Component, PropTypes} from "react";
import Localization from "localization";
import Module from "./Module";
import "./PageLanguage.less";

import { EyeIcon, ModuleIcon } from "dnn-svg-icons";

class PageLanguage extends Component {

    onUpdatePages(key, e) {
        const value = e.target.value;
        const CultureCode = this.props.local.CultureCode;
        this.props.onUpdatePages(CultureCode, key, value);
    }

    /* eslint-disable react/no-danger */
    render() {
        const iconSrc = this.props.local && this.props.local.Icon ? this.props.local.Icon : "";
        const cultureCode = this.props.local && this.props.local.CultureCode ? this.props.local.CultureCode : "";
        const page = this.props.page || {};
        const modules = this.props.modules || [];
        const moduleComponents = modules.map((module, index) => {
            return <Module
                isDefault={page.Default}
                module={module}
                onUpdateModules={this.props.onUpdateModules}
                onDeleteModule={this.props.onDeleteModule}
                onRestoreModule={this.props.onRestoreModule}
                index={index} 
                cultureCode={cultureCode}
            />;
        }); 
        return (
            <div className="page-language">
                <div className="page-language-row">
                    <img src={iconSrc} />
                    <span>{cultureCode}</span>
                    <a className="icon" href={page.PageUrl} dangerouslySetInnerHTML={{ __html: EyeIcon }}></a>
                </div>
                <div className="page-language-row">
                    <input type="text" value={page.TabName} onChange={this.onUpdatePages.bind(this, "TabName") } />
                    <input type="text" value={page.Title} onChange={this.onUpdatePages.bind(this, "Title") } />
                    <textarea value={page.Description} onChange={this.onUpdatePages.bind(this, "Description") }/>
                </div>
                <div className="page-language-row">
                    <div className="page-language-row-header">
                        <span className="icon" dangerouslySetInnerHTML={{ __html: ModuleIcon }} />
                        <span>{Localization.get("ModulesOnThisPage") }</span>
                    </div>
                    {moduleComponents }
                </div>
            </div>
        );
    }
}

PageLanguage.propTypes = {
    local: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
    modules: PropTypes.object.isRequired,
    onUpdatePages: PropTypes.func,
    onUpdateModules: PropTypes.func,
    onDeleteModule: PropTypes.func,
    onRestoreModule: PropTypes.func
};

export default PageLanguage;